import * as core from "@actions/core";

import { inputs } from "./env";
// import { GitHubAPI } from "./github";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  core.info("Hello, world!");

  console.log(`Inputs: ${JSON.stringify(inputs)}`);
  core.debug(`Inputs: ${JSON.stringify(inputs)}`);

  // TODO
  // 1. initalize a GitHub API client
  // 2. get the diff between the base and target branches
  // 3. if not diff, skip
  // 4. find if there's already an opened PR from the base to target branch
  // 5. if not, create a new PR
  // 6. get the list of issues linked to the commits
  // 7. update the PR content (put the list of issues to PR description)
  // 8. find the committers of the commits
  // 9. assign the PR to the committers and tag them as reviewers
  // try {
  //   core.info("Starting the RecNet release action");

  //   const github = new GitHubAPI(inputs.githubToken, "", "inputs.repo");

  //   // Get the diff between the base and target branches
  //   const comparison = await github.getDiff(
  //     inputs.baseBranch,
  //     inputs.targetBranch
  //   );

  //   // If no diff, skip
  //   if ((comparison.files ?? []).length === 0) {
  //     core.info("No differences found between branches. Skipping PR creation.");
  //     return;
  //   }

  //   // Find if there's already an opened PR from the base to target branch
  //   let pr = await github.findPR(inputs.baseBranch, inputs.targetBranch);

  //   if (!pr) {
  //     // If not, create a new PR
  //     pr = await github.createPR(
  //       `Release ${inputs.targetBranch} to ${inputs.baseBranch}`,
  //       inputs.baseBranch,
  //       inputs.targetBranch,
  //       "Auto-generated release PR"
  //     );
  //     core.info(`New PR created: #${pr.number}`);
  //   } else {
  //     core.info(`Existing PR found: #${pr.number}`);
  //   }

  //   // Get the list of issues linked to the commits
  //   const issues = github.getIssuesFromCommits(comparison.commits);

  //   // Update the PR content (put the list of issues to PR description)
  //   const issuesList = Array.from(issues).join(", ");
  //   const updatedBody = `Auto-generated release PR\n\nRelated issues: ${issuesList}`;
  //   await github.updatePR(pr.number, updatedBody);

  //   // Find the committers of the commits
  //   const committers = github.getCommittersFromCommits(comparison.commits);

  //   // Assign the PR to the committers and tag them as reviewers
  //   await github.requestReviewers(pr.number, Array.from(committers));
  //   await github.addAssignees(pr.number, Array.from(committers));

  //   core.info("RecNet release action completed successfully");
  // } catch (error) {
  //   core.setFailed(
  //     `Action failed with error: ${error instanceof Error ? error.message : String(error)}`
  //   );
  // }
}
