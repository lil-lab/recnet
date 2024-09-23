import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

@Catch()
export class RecnetExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RecnetExceptionFilter.name);

  public catch(exception: Error, host: ArgumentsHost): void {
    this.logger.error(exception.message, exception.stack);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let extra = null;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaException(exception);
      status = prismaError.status;
      errorCode = prismaError.errorCode;
      extra = prismaError.extra;
    } else if (exception instanceof RecnetError) {
      status = exception.getStatus();
      errorCode = exception.getErrorCode();
      extra = exception.getExtra();
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception.message;

    let error: {
      errorCode: number;
      message: string | object;
      extra?: unknown;
    } = {
      errorCode,
      message,
    };

    if (extra !== null) {
      error = { ...error, extra };
    }
    response.status(status).json(error);
  }

  private handlePrismaException(
    exception: Prisma.PrismaClientKnownRequestError
  ): { status: HttpStatus; errorCode: number; extra: unknown } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.DB_UNKNOWN_ERROR;
    const extra = { meta: exception.meta };

    // https://www.prisma.io/docs/orm/reference/error-reference#error-codes
    switch (exception.code) {
      case "P2002": {
        errorCode = ErrorCode.DB_UNIQUE_CONSTRAINT;
        status = HttpStatus.CONFLICT;
        break;
      }
      case "P2025": {
        // Use Regex to match prisma error object to our error codes
        if (/Recommendation/.test(exception.message)) {
          errorCode = ErrorCode.DB_REC_NOT_FOUND;
        } else if (/User/.test(exception.message)) {
          errorCode = ErrorCode.DB_USER_NOT_FOUND;
        }
        status = HttpStatus.NOT_FOUND;
        break;
      }
      default:
        break;
    }
    return { status, errorCode, extra };
  }
}
