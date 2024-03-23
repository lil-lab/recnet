import { ApiProperty } from "@nestjs/swagger";

export class Article {
  @ApiProperty()
  id: string;

  @ApiProperty()
  doi?: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  year: number;

  @ApiProperty()
  month?: number;

  @ApiProperty()
  isVerified: boolean;
}
