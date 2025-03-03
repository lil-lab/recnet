import { ApiProperty } from "@nestjs/swagger";
import { ReactionType } from "@prisma/client";

export class Reaction {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  recId: string;

  @ApiProperty()
  reaction: ReactionType;

  @ApiProperty()
  createdAt: string;
}
