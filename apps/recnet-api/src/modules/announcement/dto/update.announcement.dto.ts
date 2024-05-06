import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({
    example: "Weekly Digest Down",
  })
  title?: string;

  @ApiPropertyOptional({
    example: "The weekly digest will be down for maintenance.",
  })
  content?: string;

  @ApiPropertyOptional({
    example: "2024-03-26T15:06:56Z",
  })
  startAt?: Date;

  @ApiPropertyOptional({
    example: "2024-04-26T15:06:56Z",
  })
  endAt?: Date;

  @ApiPropertyOptional({
    example: true,
  })
  isActivated?: boolean;

  @ApiPropertyOptional({
    example: true,
  })
  allowClose?: boolean;
}
