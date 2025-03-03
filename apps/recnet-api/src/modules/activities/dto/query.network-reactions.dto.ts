import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class QueryNetworkReactionsDto {
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

  @ApiPropertyOptional({
    description:
      "Cutoff timestamp. It doesn't specify, it will use the latest cycle cutoff timestamp. The timestamp is in milliseconds and the time should be 11:59:59.999 PM, Tuesday.",
  })
  cutoff?: number;
}
