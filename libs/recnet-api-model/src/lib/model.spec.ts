import { expect, test } from "vitest";

import { dateSchema } from "./model";

test("Timestamp should be ISO string", () => {
  const date = new Date();
  const dateStr = date.toISOString();
  const parsed = dateSchema.safeParse(dateStr);
  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expectTypeOf(parsed.data).toBeString();
});
