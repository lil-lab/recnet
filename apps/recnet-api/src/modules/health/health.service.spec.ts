import { HealthService } from "./health.service";

describe("HealthService", () => {
  let healthService: HealthService;

  beforeEach(async () => {
    healthService = new HealthService();
  });

  it("should return status ok", async () => {
    const result = await healthService.getHealth();
    expect(result).toEqual({ status: "OK!" });
  });
});
