import { ApiProperty } from "@nestjs/swagger";

export class QueryStatsRecsDto {
  @ApiProperty({
    description: "The cutoff timestamp in milliseconds",
    type: Number,
  })
  cutoff: number;
}
