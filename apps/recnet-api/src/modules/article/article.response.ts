import { ApiProperty } from "@nestjs/swagger";

import { Article } from "./entities/article.entity";

export class GetArticleByLinkResponse {
  @ApiProperty()
  article: Article | null;
}
