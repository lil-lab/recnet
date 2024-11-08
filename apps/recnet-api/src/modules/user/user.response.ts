import { ApiProperty } from "@nestjs/swagger";

import { User } from "./entities/user.entity";
import { UserPreview } from "./entities/user.preview.entity";
import { Subscription } from "./entities/user.subscription.entity";

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

export class GetSubscriptionsResponse {
  @ApiProperty()
  subscriptions: Subscription[];
}

export class PostSubscriptionsResponse {
  @ApiProperty()
  subscription: Subscription;
}
