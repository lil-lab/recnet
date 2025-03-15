import { ApiProperty } from "@nestjs/swagger";

import { Activity, Reaction } from "./entities/activity.entity";

export class GetActivitiesResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [Activity] })
  activities: Activity[];
}

export class GetReactionsResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [Reaction] })
  reactions: Reaction[];
}
