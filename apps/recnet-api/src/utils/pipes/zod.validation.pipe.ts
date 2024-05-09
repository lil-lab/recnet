import { PipeTransform, HttpStatus, ArgumentMetadata } from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";

import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

export type MetadataType = "custom" | "body" | "query" | "param" | "header";

export class ZodValidationPipe implements PipeTransform {
  constructor(
    private schema: ZodSchema,
    private metadataType?: MetadataType
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === "custom") {
      return value;
    }

    if (this.metadataType && metadata.type !== this.metadataType) {
      return value;
    }

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
