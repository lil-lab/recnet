import { dateSchema } from "./model";
import { expect, test } from "vitest";

test("Timestamp should be coerced and parsed as Date", () => {
  const date = new Date();
  const dateStr = date.getTime();
  const parsed = dateSchema.safeParse(dateStr);
  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data).toBeInstanceOf(Date);
});
