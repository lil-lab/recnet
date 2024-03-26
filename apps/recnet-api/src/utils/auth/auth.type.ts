import {
  RecNetJwtPayload,
  firebaseJwtPayloadSchema,
  recnetJwtPayloadSchema,
  verifyFirebaseJwt,
  verifyRecnetJwt,
} from "@recnet/recnet-jwt";

export type VerifyJwtFunction =
  | typeof verifyFirebaseJwt
  | typeof verifyRecnetJwt;

export type JwtPayloadSchema =
  | typeof firebaseJwtPayloadSchema
  | typeof recnetJwtPayloadSchema;

export type RecNetJwtPayloadProps = keyof RecNetJwtPayload["recnet"];

export type AuthUser<
  Prop extends RecNetJwtPayloadProps | undefined = undefined,
> = Prop extends RecNetJwtPayloadProps
  ? RecNetJwtPayload["recnet"][Prop]
  : RecNetJwtPayload["recnet"];
