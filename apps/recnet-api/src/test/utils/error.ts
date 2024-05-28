import { expect } from "@jest/globals";
import { HttpStatus } from "@nestjs/common";

import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

export const assertRecnetError = (
  errorCode: typeof ErrorCode,
  status: HttpStatus
) => {
  return expect.objectContaining({
    errorCode,
    status,
  });
};
