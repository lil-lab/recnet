import { ApiProperty } from "@nestjs/swagger";

export class ValidateUserHandleDto {
  @ApiProperty({ example: "joannechen1223" })
  handle: string;
}
