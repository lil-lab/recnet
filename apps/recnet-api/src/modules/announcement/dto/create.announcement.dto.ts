import { ApiProperty } from "@nestjs/swagger";

export class CreateAnnouncementDto {
  @ApiProperty({
    example: "Weekly Digest Down",
  })
  title: string;

  @ApiProperty({
    example: "The weekly digest will be down for maintenance.",
  })
  content: string;

  @ApiProperty({
    example: "2024-03-26T15:06:56Z",
  })
  startAt: string;

  @ApiProperty({
    example: "2024-04-26T15:06:56Z",
  })
  endAt: string;

  @ApiProperty({
    example: true,
  })
  isActivated: boolean;

  @ApiProperty({
    example: true,
  })
  allowClose: boolean;
}
