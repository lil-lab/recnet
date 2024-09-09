import { ApiProperty } from "@nestjs/swagger";

import { Article } from "@recnet-api/modules/article/entities/article.entity";

import { UserPreview } from "../../user/entities/user.preview.entity";

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
}
