import { ApiProperty, OmitType } from "@nestjs/swagger";

import { Article } from "@recnet-api/modules/article/entities/article.entity";

export class CreateArticleDto extends OmitType(Article, [
  "id",
  "isVerified",
] as const) {}

export class CreateRecDto {
  @ApiProperty({
    description: "The description of the recommendation",
  })
  description: string;

  @ApiProperty({
    description: "Article id",
    nullable: true,
  })
  articleId: string | null;

  @ApiProperty({
    description: "Article",
    nullable: true,
  })
  article: CreateArticleDto | null;
}
