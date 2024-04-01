import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { UserRole } from "@recnet/recnet-api-model";

export class CreateUserDto {
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
  email: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  inviteCode: string;
}
