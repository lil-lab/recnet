import { ApiProperty, OmitType } from "@nestjs/swagger";

import { Article } from "@recnet-api/modules/article/entities/article.entity";

export class UpdateArticleDto extends OmitType(Article, [
  "id",
  "isVerified",
  "abstract",
] as const) {}

export class UpdateRecDto {
  @ApiProperty({
    description: "The description of the recommendation",
  })
  description: string;

  @ApiProperty({
    description: "Whether the recommendation is self-recommendation or not",
  })
  isSelfRec: boolean;

  @ApiProperty({
    description: "Article id",
    nullable: true,
  })
  articleId: string | null;

  @ApiProperty({
    description: "Article",
    nullable: true,
  })
  article: UpdateArticleDto | null;
}
