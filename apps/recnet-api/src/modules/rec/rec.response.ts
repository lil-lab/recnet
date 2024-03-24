import { ApiProperty } from "@nestjs/swagger";

import { Rec } from "./entities/rec.entity";

export class GetRecsResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [Rec] })
  recs: Rec[];
}

export class GetFeedsResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [Rec] })
  recs: Rec[];
}
