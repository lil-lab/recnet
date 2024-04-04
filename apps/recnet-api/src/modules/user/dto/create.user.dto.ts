import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "joannechen1223" })
  handle: string;

  @ApiProperty({ example: "Joanne Chen" })
  displayName: string;

  @ApiProperty({ example: "https://example.com/photo.jpg" })
  photoUrl: string;

  @ApiPropertyOptional({ example: "Cornell University" })
  affiliation: string | null;

  @ApiPropertyOptional({ example: "I am an NLP Researcher." })
  bio: string | null;

  @ApiProperty({ example: "example@cornell.edu" })
  email: string;

  @ApiProperty({
    description: "Each invite code can only be used once.",
    example: "0ca4-86yg-7d1k-qsvb",
  })
  inviteCode: string;
}
