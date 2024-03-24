import { ApiProperty } from "@nestjs/swagger";

export class DeleteRecDto {
  @ApiProperty({
    description: "The rec's id",
  })
  recId: string;
}
