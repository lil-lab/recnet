import { expect, test, describe } from "vitest";

import { interleaveWithValue } from "./interleaveWithValue";

describe("Number", () => {
  test("Should interleave with value", () => {
    const result = interleaveWithValue([1, 2, 3, 4], 0);
    expect(result).toEqual([1, 0, 2, 0, 3, 0, 4]);
  });

  test("Should interleave with value", () => {
    const result = interleaveWithValue([1, 2, 3, 4], 1);
    expect(result).toEqual([1, 1, 2, 1, 3, 1, 4]);
  });

  test("Should not interleave anything if the target array is empty", () => {
    const result = interleaveWithValue([], 1);
    expect(result).toEqual([]);
  });

  test("Should not interleave anything if the target array has length equal to one", () => {
    const result = interleaveWithValue([1], 1);
    expect(result).toEqual([1]);
  });
});
