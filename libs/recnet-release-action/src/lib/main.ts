import * as core from "@actions/core";

import { inputs } from "./env";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  core.info("Hello, world!");

  console.log(`Inputs: ${JSON.stringify(inputs)}`);
  core.debug(`Inputs: ${JSON.stringify(inputs)}`);
}
