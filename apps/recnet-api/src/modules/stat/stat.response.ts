import { ApiProperty } from "@nestjs/swagger";

export class QueryStatResponse {
  @ApiProperty()
  numUsers: number;

  @ApiProperty()
  numRecs: number;

  @ApiProperty()
  numUpcomingRecs: number;

  @ApiProperty()
  numRecsOverTime: Record<string, number>;
}

export class RecDetailResponse {
  @ApiProperty({
    description: "User's unique identifier",
    example: "user-123",
  })
  userId: string;

  @ApiProperty({
    description: "User's display name",
    example: "John Doe",
  })
  userName: string;

  @ApiProperty({
    description: "User's handle/username",
    example: "@johndoe",
  })
  userHandle: string;

  @ApiProperty({
    description: "Recommendation's unique identifier",
    example: "rec-456",
  })
  recId: string;

  @ApiProperty({
    description: "Title of the recommended paper",
    example: "Understanding Deep Learning",
  })
  recTitle: string;

  @ApiProperty({
    description: "Link to the recommended paper",
    example: "https://arxiv.org/abs/2106.12345",
  })
  recLink: string;

  @ApiProperty({
    description: "Timestamp of when the recommendation was made",
    example: 1709251200000,
  })
  timestamp: number;
}

export class QueryPeriodStatResponse {
  @ApiProperty({
    description: "List of recommendations in the period",
    type: [RecDetailResponse],
  })
  recommendations: RecDetailResponse[];

  @ApiProperty({
    description: "Start timestamp of the period (exclusive)",
    example: 1709251200000 - 7 * 24 * 60 * 60 * 1000, // One week before end
  })
  periodStart: number;

  @ApiProperty({
    description: "End timestamp of the period (inclusive)",
    example: 1709251200000,
  })
  periodEnd: number;
}
