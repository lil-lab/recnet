import { ApiProperty } from "@nestjs/swagger";

import { Rec } from "../rec/entities/rec.entity";

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

export class GetStatsRecsResponse {
  @ApiProperty({ type: [Rec] })
  recs: Rec[];
}
