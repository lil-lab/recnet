import { ApiProperty } from "@nestjs/swagger";

export class QueryMyReactionsDto {
  @ApiProperty({
    description:
      "The page number to retrieve. 1-indexed. Default is 1. Min is 1.",
    default: 1,
    minimum: 1,
  })
  page: number;

  @ApiProperty({
    description: "The number of reactions to retrieve per page. Default is 10.",
    default: 10,
    minimum: 1,
  })
  pageSize: number;
}
