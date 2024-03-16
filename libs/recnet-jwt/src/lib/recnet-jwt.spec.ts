import { verifyJwt, getPublicKey, recnetJwtPayloadSchema } from "./recnet-jwt";
import { expect, test, describe } from "vitest";
import { z } from "zod";

const envSchema = z.object({
  TEST_JWT: z.string(),
});

describe("Verify", async () => {
  const env = envSchema.parse(process.env);
  const token = env.TEST_JWT;
  const publicKey = await getPublicKey(env.TEST_JWT);
  const fakePublicKey = publicKey.replace("A", "B");

  test("Should be able to get public key from token", async () => {
    expect(publicKey).toBeDefined();
    expectTypeOf(publicKey).toBeString();
  });

  test("Should be able to decode if using correct public key", async () => {
    // ignore expiration for testing since TEST_JWT might be expired
    const payload = verifyJwt(token, publicKey, recnetJwtPayloadSchema, {
      ignoreExpiration: true,
    });
    expect(payload).toBeDefined();
    expect(payload.recnet.userId).toBeDefined();
    expectTypeOf(payload.recnet.userId).toBeString();
    expect(payload.recnet.role).toBeDefined();
    expectTypeOf(payload.recnet.role).toBeString();
  });

  test("Should throw error if using incorrect public key", async () => {
    expect(() =>
      // ignore expiration for testing since TEST_JWT might be expired
      verifyJwt(token, fakePublicKey, recnetJwtPayloadSchema, {
        ignoreExpiration: true,
      })
    ).toThrowError();
  });
});
