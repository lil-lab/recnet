import { generateJwt, verifyJwt } from "./recnet-jwt";
import { expect, test, describe } from "vitest";
import { z } from "zod";

const envSchema = z.object({
  PRIVATE_KEY: z.string().transform((s) => s.replace(/\\n/gm, "\n")),
  PUBLIC_KEY: z.string().transform((s) => s.replace(/\\n/gm, "\n")),
});

test("Keys pair is provided", () => {
  const envRes = envSchema.safeParse(process.env);
  expect(envRes.success).toBe(true);
  if (envRes.success) {
    expect(envRes.data).toBeDefined();
    expectTypeOf(envRes.data.PRIVATE_KEY).toBeString();
    expectTypeOf(envRes.data.PUBLIC_KEY).toBeString();
  }
});

describe("Sign", () => {
  const env = envSchema.parse(process.env);

  test("should throw error if payload has wrong type", () => {
    const sub = "randomUserId";
    const role = "INVALID_ROLE";
    // @ts-expect-error: role is invalid here
    expect(() => generateJwt({ sub, role }, env.PRIVATE_KEY)).toThrowError(
      "Invalid payload"
    );
  });

  test("should return jwt token", () => {
    const sub = "randomUserId";
    const adminToken = generateJwt({ sub, role: "ADMIN" }, env.PRIVATE_KEY);
    const userToken = generateJwt({ sub, role: "USER" }, env.PRIVATE_KEY);
    expectTypeOf(adminToken).toBeString();
    expectTypeOf(userToken).toBeString();
  });
});

describe("Verify", () => {
  const env = envSchema.parse(process.env);

  test("Should able to decode if using correct PUBLIC KEY", () => {
    const token = generateJwt({ sub: "123", role: "ADMIN" }, env.PRIVATE_KEY);
    const payload = verifyJwt(token, env.PUBLIC_KEY);
    expect(payload).toBeDefined();
    expect(payload.sub).toBe("123");
    expect(payload.role).toBe("ADMIN");
  });

  test("Should throw error if using incorrect PUBLIC KEY", () => {
    const token = generateJwt({ sub: "123", role: "ADMIN" }, env.PRIVATE_KEY);
    expect(() => verifyJwt(token, env.PUBLIC_KEY + "INVALID")).toThrowError();
  });

  test("Should throw error if token is expired", () => {
    const dateNow = Date.now();
    const token = generateJwt(
      {
        sub: "123",
        role: "ADMIN",
        iat: Math.floor(dateNow / 1000) - 60 * 60 * 24 * 8,
      },
      env.PRIVATE_KEY
    );
    expect(() => verifyJwt(token, env.PUBLIC_KEY)).toThrowError("jwt expired");
  });

  test("Should not throw error if not expired", () => {
    const dateNow = Date.now();
    const token = generateJwt(
      {
        sub: "123",
        role: "ADMIN",
        iat: Math.floor(dateNow / 1000) - 60 * 60 * 24 * 5,
      },
      env.PRIVATE_KEY
    );
    const payload = verifyJwt(token, env.PUBLIC_KEY);
    expect(payload).toBeDefined();
    expect(payload.role).toEqual("ADMIN");
    expect(payload.sub).toEqual("123");
  });
});
