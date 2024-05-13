import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserPreview {
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

  @ApiPropertyOptional()
  url: string | null;

  @ApiProperty()
  numFollowers: number;

  @ApiProperty()
  numRecs: number;
}
