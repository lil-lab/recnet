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
          ref: env.inputs.baseBranch,
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
      ).rejects.toThrow("Could not find the commit date of the base branch");

      expect(mockOctokit.request).toHaveBeenCalledTimes(1);
      expect(mockOctokit.request).toHaveBeenCalledWith(
        "GET /repos/{owner}/{repo}/commits/{ref}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          ref: env.inputs.baseBranch,
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
          body: expect.stringContaining("## Related Issues\n- #123\n- #456"),
        }
      );
      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: expect.stringContaining("## Related PRs\n- #789\n- #101"),
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
          body: expect.not.stringContaining("- #"),
        }
      );
    });

    it("should update PR body with only issues", async () => {
      const mockPR: PR = {
        number: 1,
        body: "Original PR body",
      } as PR;
      const issues = new Set(["123", "456"]);
      const prs = new Set<string>();

      await github.updatePRBody(mockPR, issues, prs);

      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: expect.stringContaining("## Related Issues\n- #123\n- #456"),
        }
      );
      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: expect.not.stringContaining("## Related PRs\n- #"),
        }
      );
    });

    it("should update PR body with only PRs", async () => {
      const mockPR: PR = {
        number: 1,
        body: "Original PR body",
      } as PR;
      const issues = new Set<string>();
      const prs = new Set(["789", "101"]);

      await github.updatePRBody(mockPR, issues, prs);

      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: expect.not.stringContaining("## Related Issues\n- #"),
        }
      );
      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: expect.stringContaining("## Related PRs\n- #789\n- #101"),
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
        "This is an auto-generated PR by recnet-release-action 🤖"
      );
      expect(result).toContain("## Related Issues");
      expect(result).toContain("- #123");
      expect(result).toContain("- #456");
      expect(result).toContain("## Related PRs");
      expect(result).toContain("- #789");
      expect(result).toContain("- #101");
    });

    it("should generate PR body with empty issues and PRs", () => {
      const issues = new Set<string>();
      const prs = new Set<string>();

      const result = github.generatePRBody(issues, prs);

      expect(result).toContain("## RecNet auto-release action");
      expect(result).toContain(
        "This is an auto-generated PR by recnet-release-action 🤖"
      );
      expect(result).toContain("## Related Issues");
      expect(result).toContain("## Related PRs");
      expect(result).not.toContain("- #");
    });

    it("should generate PR body with only issues", () => {
      const issues = new Set(["123", "456"]);
      const prs = new Set<string>();

      const result = github.generatePRBody(issues, prs);

      expect(result).toContain("## Related Issues");
      expect(result).toContain("- #123");
      expect(result).toContain("- #456");
      expect(result).toContain("## Related PRs");
      expect(result).not.toContain("- #789");
    });

    it("should generate PR body with only PRs", () => {
      const issues = new Set<string>();
      const prs = new Set(["789", "101"]);

      const result = github.generatePRBody(issues, prs);

      expect(result).toContain("## Related Issues");
      expect(result).toContain("## Related PRs");
      expect(result).toContain("- #789");
      expect(result).toContain("- #101");
      expect(result).not.toContain("- #123");
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

  describe("extractIssuesFromCommits", () => {
    it("should extract issue ID from commit message", () => {
      const commit: Commit = {
        commit: {
          message: "Some commit message\n\n## Related Issue\n#123",
        },
      } as Commit;

      const result = github.extractIssuesFromCommits(commit);
      expect(result).toBe("#123");
    });

    it("should extract multiple issue IDs from commit message", () => {
      const commit: Commit = {
        commit: {
          message: "Some commit message\n\n## Related Issue\n#123 #456",
        },
      } as Commit;

      const result = github.extractIssuesFromCommits(commit);
      expect(result).toBe("#123 #456");
    });

    it("should throw an error if no related issue is found", () => {
      const commit: Commit = {
        commit: {
          message: "Some commit message without related issue",
        },
      } as Commit;

      expect(() => github.extractIssuesFromCommits(commit)).toThrow(
        "Could not find related issue in commit message"
      );
    });

    it("should extract issue ID even with additional text", () => {
      const commit: Commit = {
        commit: {
          message:
            "Some commit message\n\n## Related Issue\nFixes #789 and resolves some other stuff",
        },
      } as Commit;

      const result = github.extractIssuesFromCommits(commit);
      expect(result).toBe("Fixes #789 and resolves some other stuff");
    });

    it("should handle empty issue ID", () => {
      const commit: Commit = {
        commit: {
          message: "Some commit message\n\n## Related Issue\n",
        },
      } as Commit;

      const result = github.extractIssuesFromCommits(commit);
      expect(result).toBe("");
    });

    it("should ignore case sensitivity in header", () => {
      const commit: Commit = {
        commit: {
          message: "Some commit message\n\n## RELATED ISSUE\n#999",
        },
      } as Commit;

      const result = github.extractIssuesFromCommits(commit);
      expect(result).toBe("#999");
    });
  });

  describe("getIssuesFromCommits", () => {
    it("should extract issue numbers from commit messages with full URLs and '#' references", () => {
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
        { commit: { message: "Refactor code #789" } },
        { commit: { message: "Fix typo, closes #101" } },
        { commit: { message: "Unrelated change" } },
      ] as Commit[];

      const result = github.getIssuesFromCommits(commits);

      expect(result).toEqual(new Set(["123", "456", "789", "101"]));
    });

    it("should return an empty set if no issues are found in commits", () => {
      const commits: Commit[] = [
        { commit: { message: "Update without issue reference" } },
      ] as Commit[];

      const result = github.getIssuesFromCommits(commits);

      expect(result).toEqual(new Set());
    });
  });

  describe("extractPRsFromCommits", () => {
    it("should extract the first line of the commit message", () => {
      const commit: Commit = {
        commit: {
          message: "Fix bug (#123)\n\nDetailed description here.",
        },
      } as Commit;

      const result = github.extractPRsFromCommits(commit);
      expect(result).toBe("Fix bug (#123)");
    });

    it("should handle single-line commit messages", () => {
      const commit: Commit = {
        commit: {
          message: "Update documentation",
        },
      } as Commit;

      const result = github.extractPRsFromCommits(commit);
      expect(result).toBe("Update documentation");
    });

    it("should handle commit messages with multiple lines", () => {
      const commit: Commit = {
        commit: {
          message:
            "Implement new feature (#456)\n\nThis commit adds a new feature.\nIt includes multiple changes.",
        },
      } as Commit;

      const result = github.extractPRsFromCommits(commit);
      expect(result).toBe("Implement new feature (#456)");
    });

    it("should handle commit messages without PR references", () => {
      const commit: Commit = {
        commit: {
          message: "Refactor code\n\nImprove code structure and readability.",
        },
      } as Commit;

      const result = github.extractPRsFromCommits(commit);
      expect(result).toBe("Refactor code");
    });

    it("should handle empty commit messages", () => {
      const commit: Commit = {
        commit: {
          message: "",
        },
      } as Commit;

      const result = github.extractPRsFromCommits(commit);
      expect(result).toBe("");
    });

    it("should handle commit messages with only newline characters", () => {
      const commit: Commit = {
        commit: {
          message: "\n\n\n",
        },
      } as Commit;

      const result = github.extractPRsFromCommits(commit);
      expect(result).toBe("");
    });
  });

  describe("getPRsFromCommits", () => {
    it("should extract PR numbers from commit messages with full URLs and '#' references", () => {
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
        { commit: { message: "Implement feature, closes #789" } },
        { commit: { message: "Address feedback from #101" } },
        { commit: { message: "Refactor code" } },
      ] as Commit[];

      const result = github.getPRsFromCommits(commits);

      expect(result).toEqual(new Set(["123", "456", "789", "101"]));
    });

    it("should return an empty set if no PRs are found in commits", () => {
      const commits: Commit[] = [
        { commit: { message: "Update without PR reference" } },
      ] as Commit[];

      const result = github.getPRsFromCommits(commits);

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
