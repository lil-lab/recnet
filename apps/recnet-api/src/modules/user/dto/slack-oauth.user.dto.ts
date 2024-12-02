import { ApiProperty } from "@nestjs/swagger";

export class SlackOauthDto {
  @ApiProperty({
    description: "The code from Slack OAuth.",
    example:
      "7917990338740.8077326386099.68f91412920cf8158cbb632a208afe42b29b5740c16e7829425d8db824def004",
  })
  code: string;

  @ApiProperty({
    description: "The redirect URI from Slack OAuth.",
    example: "https://localhost:3000/api/slack/oauth/callback",
  })
  redirectUri: string;
}
