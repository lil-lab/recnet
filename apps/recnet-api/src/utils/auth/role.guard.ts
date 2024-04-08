import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  UnauthorizedException,
  mixin,
} from "@nestjs/common";

import { recnetJwtPayloadSchema } from "@recnet/recnet-jwt";

import { UserRole } from "@recnet/recnet-api-model";

import { RecnetError } from "../error/recnet.error";
import { ErrorCode } from "../error/recnet.error.const";

export const RoleGuard = (allowedRoles?: UserRole[]) => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const recnetJwtPayload = recnetJwtPayloadSchema.safeParse(request.user);
      if (!recnetJwtPayload.success) {
        throw new RecnetError(
          ErrorCode.ZOD_VALIDATION_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
          recnetJwtPayload.error.message
        );
      }

      const role = recnetJwtPayload.data.recnet.role;
      if (allowedRoles && !allowedRoles.includes(role)) {
        throw new UnauthorizedException();
      }

      return true;
    }
  }

  const guard = mixin(RoleGuardMixin);
  return guard;
};
