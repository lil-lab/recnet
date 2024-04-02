import { ApiProperty } from "@nestjs/swagger";

export class CreateInviteCodeDto {
  @ApiProperty({
    description: "Owner User ID of the invite codes",
    example: "2bc2e909-4400-4e7e-8873-c20bfb65a0f9",
  })
  ownerId: string;

  @ApiProperty({
    maximum: 20,
    minimum: 1,
    description: "Number of invite codes to generate",
    example: 5,
  })
  numCodes: number;
}
