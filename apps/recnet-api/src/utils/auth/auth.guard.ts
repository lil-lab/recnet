import {
  CanActivate,
  ExecutionContext,
  mixin,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

import { getPublicKey } from "@recnet/recnet-jwt";

import { VerifyJwtFunction } from "./auth.type";

export const AuthGuard = (
  verifyJwt: VerifyJwtFunction,
  isOptional: boolean
) => {
  class AuthGuardMixin implements CanActivate {
    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        if (isOptional) {
          return true;
        }
        throw new UnauthorizedException();
      }

      try {
        const publicKey = await getPublicKey(token);
        const payload = verifyJwt(token, publicKey);
        request.user = payload;
      } catch (error) {
        if (isOptional) {
          return true;
        }
        throw new UnauthorizedException();
      }
      return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(" ") ?? [];
      return type === "Bearer" ? token : undefined;
    }
  }
  const guard = mixin(AuthGuardMixin);
  return guard;
};
