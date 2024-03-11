import { Months } from "./recnet-date-fns";
import { expect, test } from "vitest";

test("Should have 12 months", () => {
  expect(Months.length).toEqual(12);
});
