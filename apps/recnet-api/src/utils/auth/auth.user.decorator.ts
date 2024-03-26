import {
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
} from "@nestjs/common";

import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { recnetJwtPayloadSchema } from "@recnet/recnet-jwt";

import { RecNetJwtPayloadProps } from "./auth.type";

export const User = createParamDecorator<
  RecNetJwtPayloadProps | undefined,
  ExecutionContext
>((prop, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const recnetJwtPayload = recnetJwtPayloadSchema.safeParse(request.user);
  if (!recnetJwtPayload.success) {
    throw new RecnetError(
      ErrorCode.ZOD_VALIDATION_ERROR,
      HttpStatus.UNAUTHORIZED,
      "Invalid JWT payload"
    );
  }
  const recnetUser = recnetJwtPayload.data;

  return prop ? recnetUser[prop] : recnetUser;
});
