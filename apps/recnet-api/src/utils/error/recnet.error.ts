import { HttpStatus } from "@nestjs/common";

import { ErrorCode, errorMessages } from "./recnet.error.const";

export class RecnetError extends Error {
  private errorCode: number;
  private status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extra: any | null = null;

  constructor(
    errorCode: number = ErrorCode.INTERNAL_SERVER_ERROR,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message = "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extra?: any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getExtra(): any {
    return this.extra;
  }
}
