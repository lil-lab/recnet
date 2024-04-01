import { ApiProperty } from "@nestjs/swagger";

import { UserPreview } from "@recnet-api/modules/user/entities/user.preview.entity";

export class InviteCode {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  owner: UserPreview;

  @ApiProperty()
  issuedAt: Date;

  @ApiProperty()
  usedBy: UserPreview | null;

  @ApiProperty()
  usedAt: Date | null;
}
