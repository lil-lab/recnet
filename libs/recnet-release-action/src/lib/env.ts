import * as core from "@actions/core";
import { z } from "zod";

const actionInputSchema = z.object({
  githubToken: z.string(),
  baseBranch: z.string(),
  targetBranch: z.string(),
  owner: z.string(),
  repo: z.string(),
});

// parse and export
export const inputs = actionInputSchema.parse({
  githubToken: core.getInput("github-token"),
  baseBranch: core.getInput("base-branch"),
  targetBranch: core.getInput("target-branch"),
  owner: core.getInput("repo").split("/")[0],
  repo: core.getInput("repo").split("/")[1],
});
