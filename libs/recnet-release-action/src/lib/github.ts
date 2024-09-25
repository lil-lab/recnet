import * as core from "@actions/core";
import { Octokit } from "@octokit/core";
import { Endpoints } from "@octokit/types";

import { inputs } from "./env";

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

  async hasNewCommits(headBranch: string): Promise<boolean> {
    try {
      const { data: tagRef } = await this.octokit.request(
        "GET /repos/{owner}/{repo}/git/ref/{ref}",
        {
          owner: this.owner,
          repo: this.repo,
          ref: `tags/${inputs.ref}`,
        }
      );

      const { data: headRef } = await this.octokit.request(
        "GET /repos/{owner}/{repo}/git/ref/{ref}",
        {
          owner: this.owner,
          repo: this.repo,
          ref: `heads/${headBranch}`,
        }
      );

      if (tagRef.object.sha === headRef.object.sha) {
        return false;
      }

      const { data: comparison } = await this.octokit.request(
        "GET /repos/{owner}/{repo}/compare/{base}...{head}",
        {
          owner: this.owner,
          repo: this.repo,
          base: tagRef.object.sha,
          head: headRef.object.sha,
        }
      );

      return comparison.ahead_by > 0;
    } catch (error) {
      core.error("Error checking for new commits:");
      core.error(error instanceof Error ? error.message : String(error));
      throw error;
    }
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
    // Find the commit where the "staging" tag is on
    const { data: taggedCommit } = await this.octokit.request(
      "GET /repos/{owner}/{repo}/commits/{ref}",
      {
        owner: this.owner,
        repo: this.repo,
        ref: inputs.ref,
      }
    );
    // get the date of the tagged commit
    const tag = taggedCommit as Commit;
    const commitDateTs = tag.commit.author?.date;
    if (!commitDateTs) {
      throw new Error("Could not find the commit date of the staging tag");
    }

    // Get commits after the latest "staging" tag
    const { data: commits } = await this.octokit.request(
      "GET /repos/{owner}/{repo}/commits",
      {
        owner: this.owner,
        repo: this.repo,
        sha: headBranch,
        since: commitDateTs,
      }
    );

    // filter out commit where the ref is pointing to
    const filteredCommits = commits.filter((commit) => commit.sha !== tag.sha);

    return filteredCommits;
  }

  async appendIssuesToPR(originalPR: PR, issues: Set<string>) {
    const issuesList = Array.from(issues)
      .map((issue) => `- ${issue}`)
      .join("\n");
    const updatedBody = `${originalPR.body}\n${issuesList}`;

    await this.octokit.request(
      "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
      {
        owner: this.owner,
        repo: this.repo,
        pull_number: originalPR.number,
        body: updatedBody,
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

  async addAssignees(issueNumber: number, assignees: string[]) {
    await this.octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees",
      {
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        assignees,
      }
    );
  }

  getIssuesFromCommits(commits: Commit[]): Set<string> {
    const issues = new Set<string>();
    for (const commit of commits) {
      const issueMatch = commit.commit.message.match(/#(\d+)/g);
      if (issueMatch) {
        issueMatch.forEach((issue: string) => issues.add(issue));
      }
    }
    core.debug(
      `Issues found in commits: ${JSON.stringify(Array.from(issues))}`
    );
    return issues;
  }

  getCommittersFromCommits(commits: any[]): Set<string> {
    const committers = new Set<string>();
    for (const commit of commits) {
      if (commit.author) {
        committers.add(commit.author.login);
      }
    }
    return committers;
  }
}