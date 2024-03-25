import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

import { getPublicKey } from "@recnet/recnet-jwt";

import { JwtPayload, JwtPayloadSchema, VerifyJwtFunction } from "./auth.type";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly verifyJwt: VerifyJwtFunction,
    private readonly payloadSchema: JwtPayloadSchema
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const publicKey = await getPublicKey(token);
      const payload = this.verifyJwt(token, publicKey);
      const parsedPayload = this.parsePayload(payload);
      request.user = parsedPayload;
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private parsePayload(payload: JwtPayload) {
    const parsedPayload = this.payloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
      throw new UnauthorizedException();
    }
    return parsedPayload.data;
  }
}
