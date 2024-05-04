import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "joannechen1223" })
  handle: string;

  @ApiProperty({ example: "Joanne Chen" })
  displayName: string;

  @ApiProperty({ example: "https://example.com/photo.jpg" })
  photoUrl: string;

  @ApiPropertyOptional({ example: "Cornell University", maxLength: 64 })
  affiliation: string | null;

  @ApiPropertyOptional({ example: "I am an NLP Researcher.", maxLength: 200 })
  bio: string | null;

  @ApiPropertyOptional({ example: "https://example.com", maxLength: 512 })
  url: string | null;

  @ApiPropertyOptional({
    example: "https://scholar.google.com/citations?user=1234",
    maxLength: 512,
  })
  googleScholarLink: string | null;

  @ApiPropertyOptional({
    example: "https://www.semanticscholar.org/author/1234",
    maxLength: 512,
  })
  semanticScholarLink: string | null;

  @ApiPropertyOptional({ example: "joannechen", maxLength: 64 })
  openReviewUserName: string | null;

  @ApiProperty({ example: "example@cornell.edu" })
  email: string;

  @ApiProperty({
    description: "Each invite code can only be used once.",
    example: "0ca4-86yg-7d1k-qsvb",
  })
  inviteCode: string;
}
