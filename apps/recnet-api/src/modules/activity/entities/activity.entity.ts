import { ApiProperty } from "@nestjs/swagger";
import { ReactionType } from "@prisma/client";

import { Rec } from "@recnet-api/modules/rec/entities/rec.entity";

export class Reaction {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  reaction: ReactionType;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  recommendation: Rec;
}

export class Activity {
  @ApiProperty()
  type: "rec" | "reaction";

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  data: Rec | Reaction;
}
