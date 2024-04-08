import { HttpStatus } from "@nestjs/common";

import { ErrorCode, errorMessages } from "./recnet.error.const";

export class RecnetError extends Error {
  private errorCode: number;
  private status: number;
  private extra: unknown | null = null;

  constructor(
    errorCode: number = ErrorCode.INTERNAL_SERVER_ERROR,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message = "",
    extra?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.errorCode = errorCode;
    this.status = status;
    this.message = message || errorMessages[errorCode] || "Unknown error";
    this.extra = extra;
  }

  public getErrorCode(): number {
    return this.errorCode;
  }

  public getStatus(): number {
    return this.status;
  }

  public getExtra(): unknown {
    return this.extra;
  }
}
