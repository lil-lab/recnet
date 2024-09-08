import { expect, test, describe } from "vitest";

import { shuffleArray } from "./shuffle";

describe("shuffle", () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const seed = "seed";

  test("Should shuffle the array", () => {
    const result = shuffleArray(arr, seed);
    expect(result).not.toEqual(arr);
  });

  test("Should be consistent if using the same seed", () => {
    const result1 = shuffleArray(arr, seed);
    const result2 = shuffleArray(arr, seed);
    expect(result1).toEqual(result2);
  });
});
