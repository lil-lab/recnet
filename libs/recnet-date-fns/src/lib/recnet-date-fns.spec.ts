import { Months } from "./recnet-date-fns";

describe("Should have 12 months", () => {
  it("should work", () => {
    expect(Months.length).toEqual(12);
  });
});
