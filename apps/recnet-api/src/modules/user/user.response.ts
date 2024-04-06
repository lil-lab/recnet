import { ApiProperty } from "@nestjs/swagger";

import { User } from "./entities/user.entity";
import { UserPreview } from "./entities/user.preview.entity";

export class GetUsersResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [UserPreview] })
  users: UserPreview[];
}

export class GetUserMeResponse {
  @ApiProperty()
  user: User;
}
