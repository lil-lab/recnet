import { recnetJwt } from "./recnet-jwt";

describe("recnetJwt", () => {
  it("should work", () => {
    expect(recnetJwt()).toEqual("recnet-jwt");
  });
});
