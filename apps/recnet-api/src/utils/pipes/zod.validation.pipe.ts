import { PipeTransform, HttpStatus } from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";

import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new RecnetError(
        ErrorCode.ZOD_VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        undefined,
        JSON.parse((error as ZodError).message)
      );
    }
  }
}
