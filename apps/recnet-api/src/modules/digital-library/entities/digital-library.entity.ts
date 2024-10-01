import { ApiProperty } from "@nestjs/swagger";

export class DigitalLibrary {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  regex: Array<string>;

  @ApiProperty()
  rank: number;

  @ApiProperty()
  isVerified: boolean;
}
