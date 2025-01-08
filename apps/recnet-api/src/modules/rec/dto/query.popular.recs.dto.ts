import { ApiProperty } from "@nestjs/swagger";

export class QueryPopularRecsDto {
  @ApiProperty({
    description: "The page number to retrieve. 1-indexed. Min is 1.",
    minimum: 1,
  })
  page: number;

  @ApiProperty({
    description: "The number of users to retrieve per page.",
  })
  pageSize: number;
}
