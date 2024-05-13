import { UseGuards, applyDecorators } from "@nestjs/common";

import { verifyFirebaseJwt, verifyRecnetJwt } from "@recnet/recnet-jwt";

import { UserRole } from "@recnet/recnet-api-model";

import { ActivatedGuard } from "./activated.guard";
import { AuthGuard } from "./auth.guard";
import { RoleGuard } from "./role.guard";

// RoleGuard and ActivatedGuard must be placed after AuthGuard since it need to access the user info in the request
export const Auth = (allowedRoles?: UserRole[]) => {
  return applyDecorators(
    UseGuards(new AuthGuard(verifyRecnetJwt)),
    UseGuards(ActivatedGuard),
    UseGuards(RoleGuard(allowedRoles))
  );
};

export const AuthFirebase = () => UseGuards(new AuthGuard(verifyFirebaseJwt));
