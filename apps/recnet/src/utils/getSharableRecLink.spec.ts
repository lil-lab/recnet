import { describe, it, expect, beforeEach, vi } from "vitest";

import { Rec } from "@recnet/recnet-api-model";

import { getSharableLink } from "./getSharableRecLink";

// import { clientEnv } from "../clientEnv";

// Mock the clientEnv
vi.mock("../clientEnv", () => ({
  clientEnv: {
    NEXT_PUBLIC_BASE_URL: "https://example.com",
  },
}));

describe("getSharableLink", () => {
  let mockRec: Rec;

  beforeEach(() => {
    // Create a mock Rec object before each test
    mockRec = {
      id: "123456",
      // Omitting other fields for brevity
    } as Rec;
  });

  it("should return the correct sharable link", () => {
    const result = getSharableLink(mockRec);
    expect(result).toBe("https://example.com/rec/123456");
  });

  it("should use the correct base URL from clientEnv", () => {
    const result = getSharableLink(mockRec);
    expect(result).toMatch(/^https:\/\/example\.com/);
  });

  it('should append "/rec/" and the rec id to the base URL', () => {
    const result = getSharableLink(mockRec);
    expect(result).toMatch(/\/rec\/123456$/);
  });

  it("should work with different rec ids", () => {
    const anotherMockRec: Rec = { ...mockRec, id: "789012" };
    const result = getSharableLink(anotherMockRec);
    expect(result).toBe("https://example.com/rec/789012");
  });
});
