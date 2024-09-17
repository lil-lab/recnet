import { InfiniteData } from "@tanstack/react-query";
import { describe, it, expect } from "vitest";

import { getDataFromInfiniteQuery } from "./getDataFromInfiniteQuery";

describe("getDataFromInfiniteQuery", () => {
  it("should correctly map data from multiple pages", () => {
    const mockInfiniteData: InfiniteData<number[]> = {
      pages: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
      pageParams: [null, 1, 2],
    };

    const result = getDataFromInfiniteQuery(mockInfiniteData, (page) => page);
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("should handle complex data structures and custom mapping", () => {
    interface ComplexData {
      id: number;
      items: string[];
    }

    const mockInfiniteData: InfiniteData<ComplexData> = {
      pages: [
        { id: 1, items: ["a", "b"] },
        { id: 2, items: ["c", "d"] },
        { id: 3, items: ["e", "f"] },
      ],
      pageParams: [null, 1, 2],
    };

    const result = getDataFromInfiniteQuery(
      mockInfiniteData,
      (page) => page.items
    );
    expect(result).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("should handle empty pages", () => {
    const mockInfiniteData: InfiniteData<number[]> = {
      pages: [[], [], []],
      pageParams: [null, 1, 2],
    };

    const result = getDataFromInfiniteQuery(mockInfiniteData, (page) => page);
    expect(result).toEqual([]);
  });

  it("should handle a mix of empty and non-empty pages", () => {
    const mockInfiniteData: InfiniteData<number[]> = {
      pages: [[1, 2], [], [5, 6], []],
      pageParams: [null, 1, 2, 3],
    };

    const result = getDataFromInfiniteQuery(mockInfiniteData, (page) => page);
    expect(result).toEqual([1, 2, 5, 6]);
  });

  it("should work with a custom mapper function", () => {
    const mockInfiniteData: InfiniteData<number[]> = {
      pages: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
      pageParams: [null, 1, 2],
    };

    const customMapper = (page: number[]) => page.map((num) => num * 2);
    const result = getDataFromInfiniteQuery(mockInfiniteData, customMapper);
    expect(result).toEqual([2, 4, 6, 8, 10, 12]);
  });

  it("should preserve the structure returned by the mapper function", () => {
    const mockInfiniteData: InfiniteData<number[]> = {
      pages: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
      pageParams: [null, 1, 2],
    };

    const structurePreservingMapper = (page: number[]) => [page];
    const result = getDataFromInfiniteQuery(
      mockInfiniteData,
      structurePreservingMapper
    );
    expect(result).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });
});
