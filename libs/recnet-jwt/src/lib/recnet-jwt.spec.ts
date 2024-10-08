import { sign } from "jsonwebtoken";
import { expect, test, describe } from "vitest";
import { z } from "zod";

import {
  verifyJwt,
  recnetJwtPayloadSchema,
  firebaseJwtPayloadSchema,
} from "./recnet-jwt";

const envSchema = z.object({
  VITE_PRIVATE_KEY: z.string().transform((s) => s.replace(/\\n/gm, "\n")),
  VITE_PUBLIC_KEY: z.string().transform((s) => s.replace(/\\n/gm, "\n")),
});

function generateFirebaseJWT(sk: string) {
  const payload = firebaseJwtPayloadSchema.parse({
    firebase: {
      identities: {
        "google.com": ["123"],
        email: ["example.com"],
      },
    },
    source_sign_in_provider: "google.com",
  });
  return sign(payload, sk, {
    algorithm: "RS256",
  });
}

function generateRecnetJWT(sk: string) {
  const payload = recnetJwtPayloadSchema.parse({
    recnet: {
      role: "USER",
      userId: "123",
    },
  });
  return sign(payload, sk, {
    algorithm: "RS256",
  });
}

describe("verifyJwt", async () => {
  const env = envSchema.parse(process.env);
  const publicKey = env.VITE_PUBLIC_KEY;
  const fakePublicKey = publicKey.replace("A", "B");

  const firebaseJWT = generateFirebaseJWT(env.VITE_PRIVATE_KEY);
  const recnetJWT = generateRecnetJWT(env.VITE_PRIVATE_KEY);

  test("Should be able to decode firebaseJWT if using correct public key", async () => {
    const payload = verifyJwt(firebaseJWT, publicKey, firebaseJwtPayloadSchema);
    expect(payload).toBeDefined();
  });

  test("Should be able to decode recnetJWT if using correct public key", async () => {
    const payload = verifyJwt(recnetJWT, publicKey, recnetJwtPayloadSchema);
    expect(payload).toBeDefined();
    expect(payload.recnet.userId).toBeDefined();
    expectTypeOf(payload.recnet.userId).toBeString();
    expect(payload.recnet.role).toBeDefined();
    expectTypeOf(payload.recnet.role).toBeString();
  });

  test("Should throw error if using incorrect public key", async () => {
    expect(() =>
      // ignore expiration for testing since TEST_JWT might be expired
      verifyJwt(recnetJWT, fakePublicKey, recnetJwtPayloadSchema, {
        ignoreExpiration: true,
      })
    ).toThrowError();
  });
});
