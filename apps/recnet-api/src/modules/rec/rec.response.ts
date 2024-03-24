import { ApiProperty } from "@nestjs/swagger";

import { Article } from "./entities/article.entity";
import { Rec } from "./entities/rec.entity";

export class GetRecsResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [Rec] })
  recs: Rec[];
}

export class GetFeedsResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [Rec] })
  recs: Rec[];
}

export class GetUpcomingRecResponse {
  @ApiProperty({
    nullable: true,
  })
  rec: Rec | null;
}

export class CreateRecResponse {
  @ApiProperty()
  rec: Rec;
}

export class UpdateRecResponse {
  @ApiProperty()
  rec: Rec;
}

export class GetArticleByLinkResponse {
  @ApiProperty()
  article: Article | null;
}
