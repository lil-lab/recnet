import { expect, test } from "vitest";

import { notEmpty } from "./notEmpty";

test("Should filter out all null or undefined values", () => {
  const arr = [1, null, 2, undefined, 3];
  const result = arr.filter(notEmpty);
  expect(result).toEqual([1, 2, 3]);
});

test("Should not do anything if there's no null or undefined", () => {
  const arr = [1, 2, 3];
  const result = arr.filter(notEmpty);
  expect(result).toEqual(arr);
});
