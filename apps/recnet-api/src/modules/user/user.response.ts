import { ApiProperty } from "@nestjs/swagger";

import { UserPreview } from "./entities/user.preview.entity";

export class GetUsersResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [UserPreview] })
  users: UserPreview[];
}
