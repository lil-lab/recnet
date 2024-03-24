import { HttpStatus } from "@nestjs/common";
import { z } from "zod";

import { recnetJwtPayloadSchema } from "@recnet/recnet-jwt";

import { RecnetError } from "./error/recnet.error";
import { ErrorCode } from "./error/recnet.error.const";

const reqWithRecnetJwtPayload = z.object({
  jwtPayload: recnetJwtPayloadSchema,
});

export function getRecnetJWTPayloadFromReq(req: Request) {
  const parsedRes = reqWithRecnetJwtPayload.safeParse(req);
  if (parsedRes.success) {
    return parsedRes.data.jwtPayload;
  } else {
    throw new RecnetError(
      ErrorCode.ZOD_VALIDATION_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Error parsing jwt payload from request."
    );
  }
}
