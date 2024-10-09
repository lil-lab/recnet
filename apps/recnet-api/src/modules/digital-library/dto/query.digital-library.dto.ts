import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryDigitalLibraryDto {
  @ApiPropertyOptional({
    description:
      "The id of the digital library. If not specified, it will return all digital libraries.",
  })
  id?: number;

  @ApiPropertyOptional({
    description:
      "The name of the digital library. If not specified, it will return all digital libraries.",
  })
  name?: string;
}
