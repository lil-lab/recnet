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
