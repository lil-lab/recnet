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

  describe("appendIssuesToPR", () => {
    it("should append issues to PR body", async () => {
      const mockPR: PR = {
        number: 1,
        body: "Original PR body",
      } as PR;
      const issues = new Set(["123", "456"]);

      await github.appendIssuesToPR(mockPR, issues);

      expect(mockOctokit.request).toHaveBeenCalledWith(
        "PATCH /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: env.inputs.owner,
          repo: env.inputs.repo,
          pull_number: 1,
          body: "Original PR body\n- [#123](https://github.com/owner/repo/issues/123)\n- [#456](https://github.com/owner/repo/issues/456)",
        }
      );
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
            message: "Fix bug https://github.com/lil-lab/recnet/issues/123",
          },
        },
        {
          commit: {
            message: "Update docs https://github.com/lil-lab/recnet/issues/456",
          },
        },
        { commit: { message: "Refactor code" } },
      ] as Commit[];

      const result = github.getIssuesFromCommits(commits);

      expect(result).toEqual(new Set(["123", "456"]));
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