import { ApiProperty } from "@nestjs/swagger";

import { Article } from "@recnet-api/modules/article/entities/article.entity";

import { ReactionType } from "@recnet/recnet-api-model";

import { UserPreview } from "../../user/entities/user.preview.entity";

class NumReaction {
  @ApiProperty()
  type: ReactionType;

  @ApiProperty()
  count: number;
}

class Reactions {
  @ApiProperty()
  selfReactions: ReactionType[];

  @ApiProperty()
  numReactions: NumReaction[];
}

export class Rec {
  @ApiProperty()
  id: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isSelfRec: boolean;

  @ApiProperty()
  cutoff: string;

  @ApiProperty()
  user: UserPreview;

  @ApiProperty()
  article: Article;

  @ApiProperty()
  reactions: Reactions;
}
