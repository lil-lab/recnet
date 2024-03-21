import { expect, test } from "vitest";

import { Months } from "./recnet-date-fns";

test("Should have 12 months", () => {
  expect(Months.length).toEqual(12);
});
