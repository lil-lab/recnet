import { ApiProperty } from "@nestjs/swagger";

export class CreateInviteCodeResponse {
  @ApiProperty()
  inviteCodes: string[];
}
