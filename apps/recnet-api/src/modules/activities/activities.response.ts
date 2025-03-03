import { ApiProperty } from "@nestjs/swagger";

import { Reaction } from "./entities/reaction.entity";

export class GetReactionsResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [Reaction] })
  reactions: Reaction[];
}

// export class GetFeedsResponse {
//   @ApiProperty()
//   hasNext: boolean;

//   @ApiProperty({ type: [Rec] })
//   recs: Rec[];
// }
