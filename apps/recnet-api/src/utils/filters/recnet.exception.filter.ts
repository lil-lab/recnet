import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import {
  ErrorCode,
  errorMessages,
} from "@recnet-api/utils/error/recnet.error.const";

@Catch()
export class RecnetExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RecnetExceptionFilter.name);

  public catch(exception: Error, host: ArgumentsHost): void {
    this.logger.error(exception.message, exception.stack);

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
