import { ApiProperty } from "@nestjs/swagger";

export class CreateInviteCodeDto {
  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  numCodes: number;
}
