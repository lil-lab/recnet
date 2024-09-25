import { Octokit } from "@octokit/core";
import { describe, it, expect, beforeEach, vi } from "vitest";

import * as env from "./env";
import { GitHubAPI, PR, Commit } from "./github";

vi.mock("@octokit/core");
vi.mock("./env", () => ({
  inputs: {
    githubToken: "mock-token",
    headBranch: "feature",
    baseBranch: "main",
    owner: "owner",
    repo: "repo",
    ref: "refs/tags/v1.0.0",
  },
}));

describe("GitHubAPI", () => {
  let github: GitHubAPI;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockOctokit: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockOctokit = {
      request: vi.fn(),
    };

    vi.mocked(Octokit).mockImplementation(() => mockOctokit);

    github = new GitHubAPI(
      env.inputs.githubToken,
      env.inputs.owner,
      env.inputs.repo
    );
  });

  describe("findPRCreatedByBot", () => {
    it("should return a PR created by GitHub Actions", async () => {
      const mockPR: PR = {
        number: 1,
        user: { login: "github-actions[bot]" },
        labels: [],
        body: "PR body",
      } as unknown as PR;

      mockOctokit.request.mockResolvedValueOnce({ data: [mockPR] });

      const result = await github.findPRCreatedByBot(
        env.inputs.baseBranch,
        env.inputs.headBranch
      );
      expect(result).toEqual(mockPR);
      expect(mockOctokit.request).toHaveBeenCalledWith(
        "GET /repos/{owner}/{repo}/pulls",
        expect.objectContaining({
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          state: "open",
          head: `${env.inputs.owner}:${env.inputs.headBranch}`,
          base: env.inputs.baseBranch,
        })
      );
    });

    it("should return null if no PR is found", async () => {
      mockOctokit.request.mockResolvedValueOnce({ data: [] });

      const result = await github.findPRCreatedByBot(
        env.inputs.baseBranch,
        env.inputs.headBranch
      );
      expect(result).toBeNull();
    });
  });

  describe("createPR", () => {
    it("should create a new PR", async () => {
      const mockCreatedPR: PR = {
        number: 2,
        title: "New PR",
        body: "PR body",
      } as PR;

      mockOctokit.request.mockResolvedValueOnce({ data: mockCreatedPR });

      const result = await github.createPR(
        "New PR",
        env.inputs.baseBranch,
        env.inputs.headBranch,
        "PR body"
      );
      expect(result).toEqual(mockCreatedPR);
      expect(mockOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/pulls",
        expect.objectContaining({
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          title: "New PR",
          head: env.inputs.headBranch,
          base: env.inputs.baseBranch,
          body: "PR body",
        })
      );
    });
  });

  describe("getLatestCommits", () => {
    it("should return commits after the latest tag", async () => {
      const mockTaggedCommit: Commit = {
        sha: "abc123",
        commit: { author: { date: "2023-01-01T00:00:00Z" } },
      } as Commit;

      const mockCommits: Commit[] = [
        { sha: "def456", commit: { message: "Commit 1" } },
        { sha: "ghi789", commit: { message: "Commit 2" } },
      ] as Commit[];

      mockOctokit.request
        .mockResolvedValueOnce({ data: mockTaggedCommit })
        .mockResolvedValueOnce({ data: mockCommits });

      const result = await github.getLatestCommits(env.inputs.headBranch);
      expect(result).toEqual(mockCommits);
      expect(mockOctokit.request).toHaveBeenCalledTimes(2);
      expect(mockOctokit.request).toHaveBeenNthCalledWith(
        1,
        "GET /repos/{owner}/{repo}/commits/{ref}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          ref: env.inputs.ref,
        }
      );
      expect(mockOctokit.request).toHaveBeenNthCalledWith(
        2,
        "GET /repos/{owner}/{repo}/commits",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          sha: env.inputs.headBranch,
          since: "2023-01-01T00:00:00Z",
          per_page: 100,
        }
      );
    });

    it("should throw error when tag.commit.author.date is not presented", async () => {
      const mockTaggedCommit: Commit = {
        sha: "abc123",
        commit: { author: {} },
      } as Commit;

      mockOctokit.request.mockResolvedValueOnce({ data: mockTaggedCommit });

      await expect(
        github.getLatestCommits(env.inputs.headBranch)
      ).rejects.toThrow("Could not find the commit date of the staging tag");

      expect(mockOctokit.request).toHaveBeenCalledTimes(1);
      expect(mockOctokit.request).toHaveBeenCalledWith(
        "GET /repos/{owner}/{repo}/commits/{ref}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          ref: env.inputs.ref,
        }
      );
    });
  });

  describe("updatePRBody", () => {
    it("should update PR body with issues and PRs", async () => {
      const mockPR: PR = {
        number: 1,
        body: "Original PR body",
      } as PR;
      const issues = new Set(["123", "456"]);
      const prs = new Set(["789", "101"]);

      await github.updatePRBody(mockPR, issues, prs);

      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: expect.stringContaining(
            "## Related Issues\n- [#123](https://github.com/owner/repo/issues/123)\n- [#456](https://github.com/owner/repo/issues/456)"
          ),
        }
      );
      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: expect.stringContaining(
            "## Related PRs\n- [#789](https://github.com/owner/repo/pull/789)\n- [#101](https://github.com/owner/repo/pull/101)"
          ),
        }
      );
    });

    it("should update PR body with empty issues and PRs", async () => {
      const mockPR: PR = {
        number: 1,
        body: "Original PR body",
      } as PR;
      const issues = new Set<string>();
      const prs = new Set<string>();

      await github.updatePRBody(mockPR, issues, prs);

      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: expect.not.stringContaining("- [#"),
        }
      );
    });

    it("should append new content to existing PR body", async () => {
      const existingBody = `
    ## Existing Content
    This is some existing content in the PR body.

    ## Related Issues
    - [#100](https://github.com/owner/repo/issues/100)

    ## Related PRs
    - [#200](https://github.com/owner/repo/pull/200)
        `.trim();

      const mockPR: PR = {
        number: 1,
        body: existingBody,
      } as PR;

      const newIssues = new Set(["123", "456"]);
      const issues = new Set([
        ...github.getIssuesFromPRBody(mockPR),
        ...newIssues,
      ]);
      const newPRs = new Set(["789", "101"]);
      const prs = new Set([...github.getPRFromPRBody(mockPR), ...newPRs]);

      await github.updatePRBody(mockPR, issues, prs);

      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: expect.stringContaining(
            "## Related PRs\n- [#200](https://github.com/owner/repo/pull/200)\n- [#789](https://github.com/owner/repo/pull/789)\n- [#101](https://github.com/owner/repo/pull/101)\n"
          ),
        }
      );
    });
  });

  describe("generatePRBody", () => {
    it("should generate PR body with issues and PRs", () => {
      const issues = new Set(["123", "456"]);
      const prs = new Set(["789", "101"]);

      const result = github.generatePRBody(issues, prs);

      expect(result).toContain("## RecNet auto-release action");
      expect(result).toContain(
        "This is a auto-generated PR by recnet-release-action 🤖"
      );
      expect(result).toContain("## Related Issues");
      expect(result).toContain(
        "- [#123](https://github.com/owner/repo/issues/123)"
      );
      expect(result).toContain(
        "- [#456](https://github.com/owner/repo/issues/456)"
      );
      expect(result).toContain("## Related PRs");
      expect(result).toContain(
        "- [#789](https://github.com/owner/repo/pull/789)"
      );
      expect(result).toContain(
        "- [#101](https://github.com/owner/repo/pull/101)"
      );
    });

    it("should generate PR body with empty issues and PRs", () => {
      const issues = new Set<string>();
      const prs = new Set<string>();

      const result = github.generatePRBody(issues, prs);

      expect(result).toContain("## RecNet auto-release action");
      expect(result).toContain(
        "This is a auto-generated PR by recnet-release-action 🤖"
      );
      expect(result).toContain("## Related Issues");
      expect(result).toContain("## Related PRs");
      expect(result).not.toContain("- [#");
    });
  });

  describe("requestReviewers", () => {
    it("should request reviewers for a PR", async () => {
      const prNumber = 1;
      const reviewers = ["reviewer1", "reviewer2"];

      await github.requestReviewers(prNumber, reviewers);

      expect(mockOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: prNumber,
          reviewers,
        }
      );
    });
  });

  describe("addAssignees", () => {
    it("should add assignees to a PR", async () => {
      const prNumber = 1;
      const assignees = ["assignee1", "assignee2"];

      await github.addAssignees(prNumber, assignees);

      expect(mockOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          issue_number: prNumber,
          assignees,
        }
      );
    });
  });

  describe("getIssuesFromCommits", () => {
    it("should extract issue numbers from commit messages", () => {
      const commits: Commit[] = [
        {
          commit: {
            message: "Fix bug https://github.com/owner/repo/issues/123",
          },
        },
        {
          commit: {
            message: "Update docs https://github.com/owner/repo/issues/456",
          },
        },
        { commit: { message: "Refactor code" } },
      ] as Commit[];

      const result = github.getIssuesFromCommits(commits);

      expect(result).toEqual(new Set(["123", "456"]));
    });
  });

  describe("getIssuesFromPRBody", () => {
    it("should extract issue numbers from PR body", () => {
      const mockPR: PR = {
        body: "PR description\nhttps://github.com/owner/repo/issues/123\nhttps://github.com/owner/repo/issues/456",
      } as PR;

      const result = github.getIssuesFromPRBody(mockPR);

      expect(result).toEqual(new Set(["123", "456"]));
    });

    it("should return empty set if PR body is null", () => {
      const mockPR: PR = {
        body: null,
      } as PR;

      const result = github.getIssuesFromPRBody(mockPR);

      expect(result).toEqual(new Set());
    });
  });

  describe("getPRFromCommits", () => {
    it("should extract PR numbers from commit messages", () => {
      const commits: Commit[] = [
        {
          commit: {
            message: "Fix bug https://github.com/owner/repo/pull/123",
          },
        },
        {
          commit: {
            message:
              "Update docs\n\nRelated to https://github.com/owner/repo/pull/456",
          },
        },
        { commit: { message: "Refactor code" } },
      ] as Commit[];

      const result = github.getPRFromCommits(commits);

      expect(result).toEqual(new Set(["123", "456"]));
    });

    it("should return an empty set if no PRs are found in commits", () => {
      const commits: Commit[] = [
        { commit: { message: "Update without PR reference" } },
      ] as Commit[];

      const result = github.getPRFromCommits(commits);

      expect(result).toEqual(new Set());
    });
  });

  describe("getPRFromPRBody", () => {
    it("should extract PR numbers from PR body", () => {
      const mockPR: PR = {
        body: "PR description\nhttps://github.com/owner/repo/pull/123\nhttps://github.com/owner/repo/pull/456",
      } as PR;

      const result = github.getPRFromPRBody(mockPR);

      expect(result).toEqual(new Set(["123", "456"]));
    });

    it("should return an empty set if PR body is null", () => {
      const mockPR: PR = {
        body: null,
      } as PR;

      const result = github.getPRFromPRBody(mockPR);

      expect(result).toEqual(new Set());
    });

    it("should return an empty set if no PRs are found in PR body", () => {
      const mockPR: PR = {
        body: "PR description without any PR references",
      } as PR;

      const result = github.getPRFromPRBody(mockPR);

      expect(result).toEqual(new Set());
    });
  });

  describe("getCommittersFromCommits", () => {
    it("should extract unique committers from commits", () => {
      const commits: Commit[] = [
        { author: { login: "user1" } },
        { author: { login: "user2" } },
        { author: { login: "user1" } },
        { author: null },
      ] as Commit[];

      const result = github.getCommittersFromCommits(commits);

      expect(result).toEqual(new Set(["user1", "user2"]));
    });
  });
});
