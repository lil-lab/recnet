import { ApiProperty } from "@nestjs/swagger";

import { InviteCode } from "./entities/invite-code.entity";

export class CreateInviteCodeResponse {
  @ApiProperty()
  codes: string[];
}

export class GetAllInviteCodeResponse {
  @ApiProperty()
  hasNext: boolean;

  @ApiProperty({ type: [InviteCode] })
  inviteCodes: InviteCode[];
}
