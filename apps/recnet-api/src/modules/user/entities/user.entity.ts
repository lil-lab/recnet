import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { UserRole } from "@recnet/recnet-api-model";

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

  @ApiPropertyOptional()
  url: string | null;

  @ApiPropertyOptional()
  googleScholarLink: string | null;

  @ApiPropertyOptional()
  semanticScholarLink: string | null;

  @ApiPropertyOptional()
  openReviewUserName: string | null;

  @ApiProperty()
  numFollowers: number;

  @ApiProperty()
  numRecs: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  isActivated: boolean;

  @ApiProperty()
  following: UserPreview[];
}
