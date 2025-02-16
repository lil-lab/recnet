import { ApiProperty } from "@nestjs/swagger";

export class QueryPeriodStatsDto {
  @ApiProperty({
    description: "Timestamp marking the end of the period (in milliseconds)",
    example: 1709251200000,
  })
  timestamp: number;
}
