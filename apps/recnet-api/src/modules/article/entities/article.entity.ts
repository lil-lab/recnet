import { ApiProperty } from "@nestjs/swagger";

export class Article {
  @ApiProperty()
  id: string;

  @ApiProperty()
  doi: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  year: number;

  @ApiProperty()
  month: number | null;

  @ApiProperty()
  isVerified: boolean;
}
