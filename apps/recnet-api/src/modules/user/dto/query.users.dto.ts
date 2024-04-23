import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class QueryUsersDto {
  @ApiProperty({
    description:
      "The page number to retrieve. 1-indexed. Default is 1. Min is 1.",
    default: 1,
    minimum: 1,
  })
  page: number;

  @ApiProperty({
    description: "The number of users to retrieve per page. Default is 10.",
    default: 10,
    minimum: 1,
  })
  pageSize: number;

  @ApiPropertyOptional({
    description: "The user's handle.",
    example: "joannechen1223",
  })
  handle?: string;

  @ApiPropertyOptional({
    description:
      "The keyword to search for in the user's handle, displayName or affiliation. If multiple words are provided with space, they are treated as an OR search.",
    example: "joanne cornell",
  })
  keyword?: string;

  @ApiPropertyOptional({
    description: "The user's id.(uuid)",
    example: "2bc2e909-4400-4e7e-8873-c20bfb65a0f9",
  })
  id?: string;
}
