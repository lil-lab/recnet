import { ApiProperty } from "@nestjs/swagger";

export class QueryArticleDto {
  @ApiProperty({
    description: "The article's link",
  })
  link: string;
  @ApiProperty({
    description: "Use digital library service or not",
  })
  useDigitalLibrary?: boolean;
}
