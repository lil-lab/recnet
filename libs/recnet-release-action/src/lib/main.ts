import * as core from "@actions/core";

import { inputs } from "./env";
import { GitHubAPI, PR } from "./github";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // TODO
  // 1. initalize a GitHub API client
  // 2. find if there's already an opened PR from the base to target branch
  // 3. if not, create a new PR
  // 4. get the list of issues linked to the commits
  // 5. update the PR content (put the list of issues to PR description)
  // 6. find the committers of the commits
  // 7. assign the PR to the committers and tag them as reviewers
  try {
    core.info("Starting the RecNet release action");
    core.debug(`Load required inputs...`);
    core.debug(`Inputs: ${JSON.stringify(inputs)}`);

    const github = new GitHubAPI(inputs.githubToken, inputs.owner, inputs.repo);

    // Find if there's already an opened PR from the head to base branch created by this action
    let pr: PR | null = null;
    pr = await github.findPRCreatedByBot(inputs.baseBranch, inputs.headBranch);

    if (!pr) {
      // If not, create a new PR
      pr = await github.createPR(
        `Release ${inputs.headBranch} to ${inputs.baseBranch}`, // PR title
        inputs.baseBranch,
        inputs.headBranch,
        "Auto-generated release PR" // Initial PR body
      );
      core.info(`New PR created: #${pr.number}`);
    } else {
      core.info(`Existing PR found: #${pr.number}`);
    }

    // Get the latest commits from the head branch
    const commits = await github.getLatestCommits(inputs.headBranch);
    core.info(`Found ${commits.length} new commits`);
    core.debug(`Commits: ${JSON.stringify(commits)}`);

    // Get the list of issues linked to the commits
    const issues = github.getIssuesFromCommits(commits);
    core.info(`Found ${issues.size} linked issues`);
    core.debug(`Issues: ${JSON.stringify(Array.from(issues))}`);

    // // Update the PR content
    // await github.appendIssuesToPR(pr, issues);

    // // Find the committers of the commits
    // const committers = github.getCommittersFromCommits(commits);

    // // Assign the PR to the committers and tag them as reviewers
    // await github.requestReviewers(pr.number, Array.from(committers));
    // await github.addAssignees(pr.number, Array.from(committers));

    core.info("RecNet release action completed successfully");
  } catch (error) {
    core.setFailed(
      `Action failed with error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
