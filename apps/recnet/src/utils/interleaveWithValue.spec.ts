import { expect, test } from "vitest";

import { interleaveWithValue } from "./interleaveWithValue";

test("Should interleave with value: Number", () => {
  const result = interleaveWithValue([1, 2, 3, 4], 0);
  expect(result).toEqual([1, 0, 2, 0, 3, 0, 4]);
});

test("Should interleave with value: String", () => {
  const result = interleaveWithValue(["a", "b", "c", "d"], "z");
  expect(result).toEqual(["a", "z", "b", "z", "c", "z", "d"]);
});

test("Should not interleave anything if the target array is empty", () => {
  const result = interleaveWithValue([], 1);
  expect(result).toEqual([]);
});

test("Should not interleave anything if the target array has length equal to one", () => {
  const result = interleaveWithValue([1], 1);
  expect(result).toEqual([1]);
});
