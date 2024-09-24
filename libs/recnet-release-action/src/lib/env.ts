import * as core from "@actions/core";
import { z } from "zod";

const actionInputSchema = z.object({
  "github-token": z.string(),
  "base-branch": z.string(),
  "target-branch": z.string(),
});

// parse and export
export const inputs = actionInputSchema.parse({
  "github-token": core.getInput("github-token"),
  "base-branch": core.getInput("base-branch"),
  "target-branch": core.getInput("target-branch"),
});
