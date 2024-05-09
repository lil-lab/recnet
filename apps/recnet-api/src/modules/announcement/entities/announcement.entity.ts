import { ApiProperty } from "@nestjs/swagger";

import { UserPreview } from "@recnet-api/modules/user/entities/user.preview.entity";

export class Announcement {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: "Weekly Digest Down",
  })
  title: string;

  @ApiProperty({
    example: "The weekly digest will be down for maintenance.",
  })
  content: string;

  @ApiProperty({
    example: "2024-03-26 15:06:56",
  })
  startAt: Date;

  @ApiProperty({
    example: "2024-04-26 15:06:56",
  })
  endAt: Date;

  @ApiProperty({
    example: true,
  })
  isActivated: boolean;

  @ApiProperty({
    example: true,
  })
  allowClose: boolean;

  @ApiProperty({
    type: UserPreview,
  })
  createdBy: UserPreview;
}
