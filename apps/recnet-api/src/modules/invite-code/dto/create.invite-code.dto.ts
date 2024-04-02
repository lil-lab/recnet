import { ApiProperty } from "@nestjs/swagger";

export class CreateInviteCodeDto {
  @ApiProperty()
  ownerId: string;

  @ApiProperty({
    maximum: 20,
    minimum: 1,
    description: "Number of invite codes to generate",
    example: 5,
  })
  numCodes: number;
}
