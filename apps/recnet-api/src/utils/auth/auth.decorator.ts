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
    activatedOnly?: boolean;
  } = {}
) => {
  const { activatedOnly = true, allowedRoles = ["USER", "ADMIN"] } = opts;

  const guards = [UseGuards(new AuthGuard(verifyRecnetJwt))];

  if (activatedOnly) {
    guards.push(UseGuards(ActivatedGuard));
  }

  guards.push(UseGuards(RoleGuard(allowedRoles)));

  return applyDecorators(...guards);
};

export const AuthFirebase = () => UseGuards(new AuthGuard(verifyFirebaseJwt));
