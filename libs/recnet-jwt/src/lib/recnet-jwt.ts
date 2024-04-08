import { verify, VerifyOptions } from "jsonwebtoken";
import { z } from "zod";

import { userRoleSchema } from "@recnet/recnet-api-model";

export const recnetJwtPayloadSchema = z
  .object({
    recnet: z.object({
      role: userRoleSchema,
      userId: z.string(),
    }),
  })
  .passthrough();
export type RecNetJwtPayload = z.infer<typeof recnetJwtPayloadSchema>;

export enum AuthProvider {
  Google = "google.com",
  // Add other providers here if needed
}
export const providerSchema = z.nativeEnum(AuthProvider);

export const googleProviderIdentitySchema = z.object({
  [AuthProvider.Google]: z.array(z.string()),
  email: z.array(z.string()),
});

export const firebaseJwtPayloadSchema = z
  .object({
    firebase: z.object({
      identities: z.record(z.array(z.string())),
    }),
    source_sign_in_provider: providerSchema,
  })
  .passthrough();
export type FirebaseJwtPayload = z.infer<typeof firebaseJwtPayloadSchema>;

/**
 *
 * @param token string
 * @returns public key from https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
 *
 * Note: internal function
 */
export async function getPublicKey(token: string): Promise<string> {
  const publicKeySchema = z.string().transform((s) => s.replace(/\\n/gm, "\n"));
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    throw new Error("Invalid token");
  }
  const header = JSON.parse(Buffer.from(tokenParts[0], "base64").toString());
  if (!header.kid) {
    throw new Error("Invalid token");
  }
  // fetch public key from https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
  const res = await fetch(
    `https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`
  );
  const keys = (await res.json()) as Record<string, unknown>;
  const publicKey = keys[header.kid];
  if (!publicKey) {
    throw new Error("Public key not found");
  }
  return publicKeySchema.parse(publicKey);
}

/**
 *
 * @param token string: jwt token
 * @param pk string: public key
 * @param payloadSchema z.ZodSchema: zod schema for jwt payload, see `recnetJwtPayloadSchema` & `firebaseJwtPayloadSchema` at `libs/recnet-jwt/src/recnet-jwt.ts`
 * @param verifyOptions VerifyOptions (default `{}`): see interface VerifyOptions from jsonwebtoken: https://github.com/auth0/node-jsonwebtoken
 * @returns payload of jwt token
 */
export function verifyJwt<ZSchema extends z.ZodSchema>(
  token: string,
  pk: string,
  payloadSchema: ZSchema,
  verifyOptions?: VerifyOptions
): z.infer<ZSchema> {
  const options = verifyOptions || {};
  const payload = verify(token, pk, {
    algorithms: ["RS256"],
    ...options,
  });
  const payloadRes = payloadSchema.safeParse(payload);
  if (!payloadRes.success) {
    throw new Error("Invalid payload");
  }
  return payloadRes.data;
}

/**
 * @param token string: jwt token
 * @param pk string: public key
 * @param verifyOptions VerifyOptions (default `{}`): see interface VerifyOptions from jsonwebtoken https://github.com/auth0/node-jsonwebtoken
 * @returns FirebaseJwtPayload: payload of jwt token
 *
 * Note: Use this for `/login` API since when calling `/login` API, the recnet's custom claims are not included in the token
 */
export function verifyFirebaseJwt(
  token: string,
  pk: string,
  verifyOptions?: VerifyOptions
): FirebaseJwtPayload {
  return verifyJwt(token, pk, firebaseJwtPayloadSchema, verifyOptions);
}

/**
 * @param token string: jwt token
 * @param pk string: public key
 * @param verifyOptions VerifyOptions (default `{}`): see interface VerifyOptions from jsonwebtoken https://github.com/auth0/node-jsonwebtoken
 * @returns RecNetJwtPayload: payload of jwt token
 */
export function verifyRecnetJwt(
  token: string,
  pk: string,
  verifyOptions?: VerifyOptions
): RecNetJwtPayload {
  return verifyJwt(token, pk, recnetJwtPayloadSchema, verifyOptions);
}
