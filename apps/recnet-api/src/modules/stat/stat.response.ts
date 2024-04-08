import { ApiProperty } from "@nestjs/swagger";

export class QueryStatResponse {
  @ApiProperty()
  numUsers: number;

  @ApiProperty()
  numRecs: number;

  @ApiProperty()
  numUpcomingRecs: number;

  @ApiProperty()
  numRecsOverTime: Record<string, number>;
}
