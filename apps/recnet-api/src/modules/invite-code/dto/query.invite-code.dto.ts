import { ApiProperty } from "@nestjs/swagger";

export class QueryInviteCodeDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({
    description: "Whether should return only used codes or not",
    required: false,
    default: undefined,
  })
  used?: boolean;
}
