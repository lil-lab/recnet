import * as core from "@actions/core";
import { z } from "zod";

const actionInputSchema = z.object({
  githubToken: z.string(),
  headBranch: z.string(),
  baseBranch: z.string(),
  owner: z.string(),
  repo: z.string(),
});

// parse and export
export const inputs = actionInputSchema.parse({
  githubToken: core.getInput("github-token"),
  headBranch: core.getInput("head-branch"),
  baseBranch: core.getInput("base-branch"),
  owner: core.getInput("repo").split("/")[0],
  repo: core.getInput("repo").split("/")[1],
});
