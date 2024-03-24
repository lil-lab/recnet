import { ApiProperty } from "@nestjs/swagger";

export class UserPreview {
  @ApiProperty()
  id: string;

  @ApiProperty()
  handle: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  photoUrl: string;

  @ApiProperty()
  affiliation: string | null;

  @ApiProperty()
  bio: string | null;

  @ApiProperty()
  numFollowers: number;
}
