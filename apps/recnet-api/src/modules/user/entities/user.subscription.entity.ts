import { ApiProperty } from "@nestjs/swagger";
import { Channel, SubscriptionType } from "@prisma/client";

export class Subscription {
  @ApiProperty()
  type: SubscriptionType;

  @ApiProperty()
  channels: Channel[];
}
