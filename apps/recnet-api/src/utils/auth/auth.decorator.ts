import { UseGuards, applyDecorators } from "@nestjs/common";

import { verifyFirebaseJwt, verifyRecnetJwt } from "@recnet/recnet-jwt";

import { UserRole } from "@recnet/recnet-api-model";

import { ActivatedGuard } from "./activated.guard";
import { AuthGuard } from "./auth.guard";
import { RoleGuard } from "./role.guard";

// ActivatedGuard and RoleGuard must be placed after AuthGuard since it need to access the user info in the request
export const Auth = (
  opts: {
    allowedRoles?: UserRole[];
    allowNonActivated?: boolean;
  } = {}
) => {
  const { allowNonActivated = false, allowedRoles = ["USER", "ADMIN"] } = opts;
  const isOptional = false;

  return applyDecorators(
    UseGuards(AuthGuard(verifyRecnetJwt, isOptional)),
    UseGuards(ActivatedGuard(allowNonActivated)),
    UseGuards(RoleGuard(allowedRoles))
  );
};

export const AuthOptional = () => {
  const isOptional = true;
  return UseGuards(AuthGuard(verifyRecnetJwt, isOptional));
};

export const AuthFirebase = () => {
  const isOptional = false;
  return UseGuards(AuthGuard(verifyFirebaseJwt, isOptional));
};
