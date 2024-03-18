import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

import {
  ErrorCode,
  errorMessages,
} from "@recnet-api/utils//error/recnet.error.const";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";

@Catch()
export class RecnetExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException || exception instanceof RecnetError
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorCode =
      exception instanceof RecnetError
        ? exception.getErrorCode()
        : ErrorCode.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof RecnetError
          ? exception.message
          : errorMessages[ErrorCode.INTERNAL_SERVER_ERROR];

    let error: {
      errorCode: number;
      message: string | object;
      extra?: unknown;
    } = {
      errorCode,
      message,
    };

    if (exception instanceof RecnetError && exception.getExtra() !== null) {
      error = { ...error, extra: exception.getExtra() };
    }
    response.status(status).json(error);
  }
}
