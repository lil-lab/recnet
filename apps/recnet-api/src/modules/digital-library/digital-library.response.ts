import { ApiProperty } from "@nestjs/swagger";

import { DigitalLibrary } from "./entities/digital-library.entity";

export class GetDigitalLibrariesResponse {
  @ApiProperty()
  digitalLibraries: Array<DigitalLibrary>;
}
