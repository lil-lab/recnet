import { ApiProperty } from "@nestjs/swagger";

export class UpdateDigitalLibraryDto {
  @ApiProperty({
    example: "arXiv",
  })
  name?: string;

  @ApiProperty({
    example: ["https?://arxiv.org/(abs|pdf|html)/(?<id>[0-9.]+(v[0-9]+)?)"],
  })
  regex?: Array<string>;

  @ApiProperty({
    example: true,
  })
  isVerified?: boolean;
}

export class UpdateRank {
  @ApiProperty({
    description: "The ID of the digital library.",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description:
      "The rank of the digital library. The smaller the rank, the higher the priority. The rank must be between 1 and 100.",
    example: 1,
    minimum: 1,
    maximum: 100,
  })
  rank: number;
}

export type UpdateDigitalLibrariesRankDto = Array<UpdateRank>;
