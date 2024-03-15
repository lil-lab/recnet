import { verify, VerifyOptions } from "jsonwebtoken";
import { z } from "zod";
import { userRoleSchema } from "@recnet/recnet-api-model";

export function recnetJwt(): string {
  return "recnet-jwt";
}

export const recnetJwtPayloadSchema = z
  .object({
    recnet: z.object({
      role: userRoleSchema,
      userId: z.string(),
    }),
  })
  .passthrough();
export type RecNetJwtPayload = z.infer<typeof recnetJwtPayloadSchema>;

export const firebaseJwtPayloadSchema = recnetJwtPayloadSchema
  .omit({
    recnet: true,
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
  const keys = await res.json();
  const publicKey = keys[header.kid];
  return publicKeySchema.parse(publicKey);
}

/**
 *
 * @param token string: jwt token
 * @param pk string: public key
 * @param verifyOptions VerifyOptions (default `{}`): see interface VerifyOptions from jsonwebtoken & https://github.com/auth0/node-jsonwebtoken
 * @param payloadSchema z.ZodSchema (default `recnetJwtPayloadSchema`): zod schema for jwt payload, see `recnetJwtPayloadSchema` & `firebaseJwtPayloadSchema`
 * @returns payload of jwt token
 *
 * Note: For `/login` API, use `firebaseJwtPayloadSchema` as payloadSchema since when user log in, the jwt hasn't contain any custom recnet's userclaim.
 * Else, use `recnetJwtPayloadSchema` (it's default value)
 */
export function verifyJwt<ZSchema extends z.ZodSchema>(
  token: string,
  pk: string,
  verifyOptions?: VerifyOptions,
  payloadSchema?: ZSchema
): z.infer<ZSchema> {
  const schema = payloadSchema || recnetJwtPayloadSchema;
  const options = verifyOptions || {};
  const payload = verify(token, pk, {
    algorithms: ["RS256"],
    ...options,
  });
  const payloadRes = schema.safeParse(payload);
  if (!payloadRes.success) {
    throw new Error("Invalid payload");
  }
  return payloadRes.data;
}
