import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  mixin,
} from "@nestjs/common";
import { Request } from "express";

import {
  verifyFirebaseJwt,
  verifyRecnetJwt,
  getPublicKey,
} from "@recnet/recnet-jwt";

import { JWTType } from "./token.type";

export const AuthGuard = (jwtType: JWTType) => {
  class RoleGuardMixin implements CanActivate {
    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const publicKey = await getPublicKey(token);
        if (jwtType === "FirebaseJWT") {
          const payload = verifyFirebaseJwt(token, publicKey);
          request.jwtPayload = payload;
        } else {
          const payload = verifyRecnetJwt(token, publicKey);
          request.jwtPayload = payload;
        }
      } catch (error) {
        throw new UnauthorizedException();
      }
      return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(" ") ?? [];
      return type === "Bearer" ? token : undefined;
    }
  }

  const guard = mixin(RoleGuardMixin);
  return guard;
};
