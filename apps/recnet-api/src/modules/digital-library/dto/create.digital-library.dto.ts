import { ApiProperty } from "@nestjs/swagger";

export class CreateDigitalLibraryDto {
  @ApiProperty({
    example: "arXiv",
  })
  name: string;

  @ApiProperty({
    example: ["https?://arxiv.org/(abs|pdf|html)/(?<id>[0-9.]+(v[0-9]+)?)"],
  })
  regex: Array<string>;

  @ApiProperty({
    description:
      "The rank of the digital library. The smaller the rank, the higher the priority.",
    example: 1,
  })
  rank: number;

  @ApiProperty({
    example: true,
  })
  isVerified: boolean;
}
