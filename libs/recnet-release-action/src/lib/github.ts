import * as core from "@actions/core";
import { Octokit } from "@octokit/core";
import { Endpoints } from "@octokit/types";

import { inputs } from "./env";

const ReleasePRTemplate = [
  {
    type: "h2",
    innerText: "RecNet auto-release action",
  },
  {
    type: "text",
    innerText: "This is an auto-generated PR by recnet-release-action 🤖",
  },
  {
    type: "text",
    innerText:
      "Please make sure to test your changes in staging before merging. ",
  },
  {
    type: "h2",
    innerText: "Related Issues",
  },
  {
    type: "h2",
    innerText: "Related PRs",
  },
  {
    type: "h2",
    innerText: "Staging links",
  },
  {
    type: "text",
    innerText:
      "recnet-web: [https://vercel.live/link/recnet-git-dev-recnet-542617e7.vercel.app](https://vercel.live/link/recnet-git-dev-recnet-542617e7.vercel.app)",
  },
  {
    type: "text",
    innerText:
      "recnet-api: [https://dev-api.recnet.io/api](https://dev-api.recnet.io/api)",
  },
] as const;

type FoundPR =
  Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"]["data"][number];
type CreatedPR =
  Endpoints["POST /repos/{owner}/{repo}/pulls"]["response"]["data"];
export type PR = FoundPR | CreatedPR;

export type REF =
  Endpoints["GET /repos/{owner}/{repo}/git/ref/{ref}"]["response"]["data"];

export type Commit =
  Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"]["data"];

export class GitHubAPI {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(token: string, owner: string, repo: string) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  async findPRCreatedByBot(
    baseBranch: string,
    headBranch: string
  ): Promise<FoundPR | null> {
    const { data } = await this.octokit.request(
      "GET /repos/{owner}/{repo}/pulls",
      {
        owner: this.owner,
        repo: this.repo,
        state: "open",
        head: `${this.owner}:${headBranch}`,
        base: baseBranch,
      }
    );
    // Filter PRs created by GitHub Actions
    const actionCreatedPRs = data.filter(
      (pr) =>
        pr.user?.login === "github-actions[bot]" || // Check if created by GitHub Actions bot
        pr.labels.some((label) => label.name === "automated-pr") // Or check for a specific label
    );
    core.debug(
      `Found PRs created by GitHub Actions: ${actionCreatedPRs.length}`
    );
    core.debug(`PRs: ${JSON.stringify(actionCreatedPRs)}`);

    return actionCreatedPRs.length > 0 ? actionCreatedPRs[0] : null;
  }

  async createPR(
    title: string,
    baseBranch: string,
    headBranch: string,
    body: string
  ): Promise<CreatedPR> {
    const { data } = await this.octokit.request(
      "POST /repos/{owner}/{repo}/pulls",
      {
        owner: this.owner,
        repo: this.repo,
        title,
        head: headBranch,
        base: baseBranch,
        body,
      }
    );
    return data;
  }

  async getLatestCommits(headBranch: string): Promise<Commit[]> {
    // Find the latest commit on base branch
    const { data: baseBranchLatestCommit } = await this.octokit.request(
      "GET /repos/{owner}/{repo}/commits/{ref}",
      {
        owner: this.owner,
        repo: this.repo,
        ref: inputs.baseBranch,
      }
    );
    // get the date of the tagged commit
    const commitDateTs = baseBranchLatestCommit.commit.author?.date;
    if (!commitDateTs) {
      throw new Error("Could not find the commit date of the base branch");
    }

    // Get commits after the latest "staging" tag
    const { data: commits } = await this.octokit.request(
      "GET /repos/{owner}/{repo}/commits",
      {
        owner: this.owner,
        repo: this.repo,
        sha: headBranch,
        since: commitDateTs,
        per_page: 100,
      }
    );

    // filter out commit where the ref is pointing to
    const filteredCommits = commits.filter(
      (commit) => commit.sha !== baseBranchLatestCommit.sha
    );

    return filteredCommits;
  }

  async updatePRBody(originalPR: PR, issues: Set<string>, prs: Set<string>) {
    const newBody = this.generatePRBody(issues, prs);

    await this.octokit.request(
      "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
      {
        owner: this.owner,
        repo: this.repo,
        pull_number: originalPR.number,
        body: newBody,
      }
    );
  }

  async requestReviewers(prNumber: number, reviewers: string[]) {
    await this.octokit.request(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
      {
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        reviewers,
      }
    );
  }

  async addAssignees(prNumber: number, assignees: string[]) {
    await this.octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees",
      {
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        assignees,
      }
    );
  }

  extractIssuesFromCommits(commit: Commit): string {
    /**
        Extract the part of the commit message that contains the issue ID
        This implementation depends on our PULL_REQUEST_TEMPLATE.md
        Find the line that starts with "## Related Issue" and extract the string after it
    */
    const message = commit.commit.message;
    const index = message.indexOf("## Related Issue");
    if (index === -1) {
      throw new Error("Could not find related issue in commit message");
    }
    return message.substring(index + "## Related Issue".length).trim();
  }

  getIssuesFromCommits(commits: Commit[]): Set<string> {
    const issues = new Set<string>();
    for (const commit of commits) {
      try {
        const extractedIssues = this.extractIssuesFromCommits(commit);

        // Extract full GitHub issue URLs
        const urlMatches = extractedIssues.match(
          new RegExp(
            `https://github.com/${this.owner}/${this.repo}/issues/(\\d+)`,
            "g"
          )
        );
        if (urlMatches) {
          urlMatches.forEach((match: string) => {
            const id = match.split("/").pop();
            if (id) issues.add(id);
          });
        }

        // Extract issue IDs from "#123" pattern
        const hashMatches = extractedIssues.match(/#(\d+)/g);
        if (hashMatches) {
          hashMatches.forEach((match: string) => {
            const id = match.substring(1); // Remove the '#' character
            issues.add(id);
          });
        }
      } catch (error) {
        // If extractIssuesFromCommits throws an error, we skip this commit
        core.debug(`Failed to extract issues from commit: ${error}`);
      }
    }
    return issues;
  }

  extractPRsFromCommits(commit: Commit): string {
    /**
        Extract the part of the commit message that contains the PR ID
        This implementation works under the assumption that the PR ID is in the first line of commit message
    */
    return commit.commit.message.split("\n")[0];
  }

  getPRsFromCommits(commits: Commit[]): Set<string> {
    const prs = new Set<string>();
    for (const commit of commits) {
      const extractedPRs = this.extractPRsFromCommits(commit);

      // Extract full GitHub PR URLs
      const urlMatches = extractedPRs.match(
        new RegExp(
          `https://github.com/${this.owner}/${this.repo}/pull/(\\d+)`,
          "g"
        )
      );
      if (urlMatches) {
        urlMatches.forEach((match: string) => {
          const id = match.split("/").pop();
          if (id) prs.add(id);
        });
      }

      // Extract PR numbers from "#123" pattern
      const hashMatches = extractedPRs.match(/#(\d+)/g);
      if (hashMatches) {
        hashMatches.forEach((match: string) => {
          const id = match.substring(1); // Remove the '#' character
          prs.add(id);
        });
      }
    }
    return prs;
  }

  generatePRBody(issues: Set<string>, prs: Set<string>): string {
    const issuesList = Array.from(issues)
      .map((issueId) => `- #${issueId}`)
      .join("\n");

    const prsList = Array.from(prs)
      .map((prId) => `- #${prId}`)
      .join("\n");

    let body = "";
    for (const item of ReleasePRTemplate) {
      if (item.type === "h2") {
        body += `## ${item.innerText}\n`;
        if (item.innerText === "Related Issues") {
          body += `${issuesList}\n`;
        } else if (item.innerText === "Related PRs") {
          body += `${prsList}\n`;
        }
      } else if (item.type === "text") {
        body += `${item.innerText}\n`;
      }
    }
    return body;
  }

  getCommittersFromCommits(commits: Commit[]): Set<string> {
    const committers = new Set<string>();
    for (const commit of commits) {
      if (commit.author) {
        committers.add(commit.author.login);
      }
    }
    return committers;
  }
}
