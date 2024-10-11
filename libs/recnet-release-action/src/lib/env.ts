import { z } from "zod";

const actionInputSchema = z.object({
  githubToken: z.string(),
  headBranch: z.string(),
  baseBranch: z.string(),
  owner: z.string(),
  repo: z.string(),
});

const githubToken = process.env["GITHUB_TOKEN"];
const headBranch = process.env["HEAD_BRANCH"];
const baseBranch = process.env["BASE_BRANCH"];
const repo = process.env["REPO"] || "";

// parse and export
export const inputs = actionInputSchema.parse({
  githubToken: githubToken,
  headBranch: headBranch,
  baseBranch: baseBranch,
  owner: repo.split("/")[0],
  repo: repo.split("/")[1],
});
