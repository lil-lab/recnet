import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class QueryInviteCodeDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiPropertyOptional({
    description:
      "If used is true, it will only return invite codes that have been used. If it's false, it will only return invite codes that haven't been used. Otherwise, it will return all invite codes.",
    required: false,
    default: undefined,
  })
  used?: boolean;
}
