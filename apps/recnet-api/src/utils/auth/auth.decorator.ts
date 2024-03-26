import { UseGuards } from "@nestjs/common";

import {
  firebaseJwtPayloadSchema,
  recnetJwtPayloadSchema,
  verifyFirebaseJwt,
  verifyRecnetJwt,
} from "@recnet/recnet-jwt";

import { AuthGuard } from "./auth.guard";

export const Auth = () =>
  UseGuards(new AuthGuard(verifyRecnetJwt, recnetJwtPayloadSchema));

export const AuthFirebase = () =>
  UseGuards(new AuthGuard(verifyFirebaseJwt, firebaseJwtPayloadSchema));
