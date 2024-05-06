import { ApiProperty } from "@nestjs/swagger";

export class CreateInviteCodeDto {
  @ApiProperty({
    description:
      "Owner User ID of the invite codes. If it's null, will generate invite-codes for all users.",
    example: "2bc2e909-4400-4e7e-8873-c20bfb65a0f9",
    nullable: true,
  })
  ownerId: string | null;

  @ApiProperty({
    maximum: 20,
    minimum: 1,
    description: "Number of invite codes to generate",
    example: 5,
  })
  numCodes: number;

  @ApiProperty({
    description:
      "Maximum invite code any user can have after this operation. If it's null, no limit.",
    example: 5,
    nullable: true,
  })
  upperBound: number | null;
}
