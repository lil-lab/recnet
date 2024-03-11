import { sign, verify, SignOptions, VerifyOptions } from "jsonwebtoken";
import { z } from "zod";
import { userRoleSchema } from "@recnet/recnet-api-model";

export function recnetJwt(): string {
  return "recnet-jwt";
}

export const recnetJwtPayloadSchema = z
  .object({
    role: userRoleSchema,
    sub: z.string(),
  })
  .passthrough();
export type RecNetJwtPayload = z.infer<typeof recnetJwtPayloadSchema>;

/**
  Generate jwt token and sign it by private key.
  Use RS256 algorithm.
  Throw error if payload is invalid.

  Note: timestamp's unit is second.
*/
export function generateJwt(
  payload: RecNetJwtPayload,
  sk: string,
  signOptions?: SignOptions
): string {
  const payloadRes = recnetJwtPayloadSchema.safeParse(payload);
  if (!payloadRes.success) {
    throw new Error("Invalid payload");
  }
  const parsedPayload = payloadRes.data;
  const options = signOptions || {};
  const token = sign(parsedPayload, sk, {
    algorithm: "RS256",
    expiresIn: "7 days",
    audience: "recnet-api",
    issuer: "recnet",
    ...options,
  });
  return token;
}

/**
  Verify jwt token and return payload if it's valid and not expired.
  Throw error if token is invalid.

  Note: timestamp's unit is second.
*/
export function verifyJwt(
  token: string,
  pk: string,
  verifyOptions?: VerifyOptions
): RecNetJwtPayload {
  const options = verifyOptions || {};
  const payload = verify(token, pk, {
    algorithms: ["RS256"],
    audience: "recnet-api",
    issuer: "recnet",
    ...options,
  });
  const payloadRes = recnetJwtPayloadSchema.safeParse(payload);
  if (!payloadRes.success) {
    throw new Error("Invalid payload");
  }
  return payloadRes.data;
}
