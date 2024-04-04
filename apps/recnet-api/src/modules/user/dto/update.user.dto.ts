import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "joannechen1223" })
  handle?: string;

  @ApiPropertyOptional({ example: "Joanne Chen" })
  displayName?: string;

  @ApiPropertyOptional({ example: "https://example.com/photo.jpg" })
  photoUrl?: string;

  @ApiPropertyOptional({ example: "Cornell University" })
  affiliation?: string | null;

  @ApiPropertyOptional({ example: "I am an NLP Researcher." })
  bio?: string | null;

  @ApiPropertyOptional({ example: "example@cornell.edu" })
  email?: string;
}
