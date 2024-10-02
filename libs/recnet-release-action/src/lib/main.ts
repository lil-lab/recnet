import * as core from "@actions/core";

import { inputs } from "./env";
import { GitHubAPI, PR } from "./github";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  /*
    1. initalize a GitHub API client
    2. if no diff between prev staging ref, skip
    3. find if there's already an opened PR from the base to target branch
    4. if not, create a new PR
    5. get the list of issues linked to the commits
    6. update the PR content (append the list of issues to PR description)
    7. find the committers of the commits
    8. assign the PR to the committers and tag them as reviewers
  */
  try {
    core.info("Starting the RecNet release action");
    core.debug(`Load required inputs...`);
    core.debug(`Inputs: ${JSON.stringify(inputs)}`);

    const github = new GitHubAPI(inputs.githubToken, inputs.owner, inputs.repo);

    const commits = await github.getLatestCommits(inputs.headBranch);
    core.info(`Found ${commits.length} new commits`);
    core.info(`Commits: ${JSON.stringify(commits)}`);

    if (commits.length === 0) {
      core.info("No new commits found. Exiting...");
      return;
    }

    let pr: PR | null = null;
    pr = await github.findPRCreatedByBot(inputs.baseBranch, inputs.headBranch);

    if (!pr) {
      pr = await github.createPR(
        `Release ${inputs.headBranch} to ${inputs.baseBranch}`, // PR title
        inputs.baseBranch,
        inputs.headBranch,
        "init body" // Initial PR body
      );
      core.info(`New PR created: #${pr.number}`);
    } else {
      core.info(`Existing PR found: #${pr.number}`);
    }

    const issuesFromCommits = github.getIssuesFromCommits(commits);
    const issuesFromPRBody = github.getIssuesFromPRBody(pr);
    const issues = new Set([...issuesFromCommits, ...issuesFromPRBody]);
    core.info(`Found ${issuesFromCommits.size} newly linked issues`);
    core.info(`Found ${issuesFromPRBody.size} from PR desc`);
    core.debug(`Issues: ${JSON.stringify(Array.from(issues))}`);

    const prsFromCommits = github.getPRFromCommits(commits);
    const prsFromPRBody = github.getPRFromPRBody(pr);
    const prs = new Set([...prsFromCommits, ...prsFromPRBody]);
    core.info(`Found ${prsFromCommits.size} newly linked PRs`);
    core.info(`Found ${prsFromPRBody.size} from PR desc`);
    core.debug(`PRs: ${JSON.stringify(Array.from(prs))}`);

    // Update the PR content
    await github.updatePRBody(pr, issues, prs);

    // Find the committers of the commits
    const committers = github.getCommittersFromCommits(commits);

    // Assign the PR to the committers and tag them as reviewers
    await github.requestReviewers(pr.number, Array.from(committers));
    await github.addAssignees(pr.number, Array.from(committers));

    core.info("RecNet release action completed successfully");
  } catch (error) {
    core.setFailed(
      `Action failed with error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
