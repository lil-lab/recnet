import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { UserPreview } from "./user.preview.entity";

export class User {
  @ApiProperty()
  id: string;

  @ApiProperty()
  handle: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  photoUrl: string;

  @ApiPropertyOptional()
  affiliation: string | null;

  @ApiPropertyOptional()
  bio: string | null;

  @ApiProperty()
  numFollowers: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  following: UserPreview[];
}
