import { ApiProperty } from "@nestjs/swagger";

import { Article } from "./article.entity";

import { UserPreview } from "../../user/entities/user.preview.entity";

export class Rec {
  @ApiProperty()
  id: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  cutoff: string;

  @ApiProperty()
  user: UserPreview;

  @ApiProperty()
  article: Article;
}
