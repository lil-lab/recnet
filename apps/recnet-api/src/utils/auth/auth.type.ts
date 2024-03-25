import {
  firebaseJwtPayloadSchema,
  recnetJwtPayloadSchema,
  verifyFirebaseJwt,
  verifyRecnetJwt,
  FirebaseJwtPayload,
  RecNetJwtPayload,
} from "@recnet/recnet-jwt";

export type VerifyJwtFunction =
  | typeof verifyFirebaseJwt
  | typeof verifyRecnetJwt;

export type JwtPayload = FirebaseJwtPayload | RecNetJwtPayload;

export type JwtPayloadSchema =
  | typeof firebaseJwtPayloadSchema
  | typeof recnetJwtPayloadSchema;
