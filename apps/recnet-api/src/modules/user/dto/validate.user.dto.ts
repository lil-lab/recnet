import { ApiProperty } from "@nestjs/swagger";

export class ValidateUserHandleDto {
  @ApiProperty({ example: "joannechen1223" })
  handle: string;
}

export class ValidateUserInviteCodeDto {
  @ApiProperty({ example: "0ca4-86yg-7d1k-qsvb" })
  inviteCode: string;
}
