import { ApiProperty } from "@nestjs/swagger";

import { Announcement } from "./entities/announcement.entity";

export class GetAnnouncementsResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ example: 35 })
  totalCount: number;

  @ApiProperty({ type: [Announcement] })
  announcements: Announcement[];
}
