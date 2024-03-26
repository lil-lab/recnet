import { ApiProperty } from "@nestjs/swagger";

export class QueryArticleDto {
  @ApiProperty({
    description: "The article's link",
  })
  link: string;
}
