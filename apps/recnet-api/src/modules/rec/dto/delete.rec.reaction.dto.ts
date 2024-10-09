import { ApiProperty } from "@nestjs/swagger";

export class DeleteRecReactionDto {
  @ApiProperty({
    description:
      "The enum of the emoji reaction. One of ['THUMBS_UP', 'THINKING', 'SURPRISED', 'CRYING', 'STARRY_EYES', 'MINDBLOWN', 'EYES', 'ROCKET', 'HEART', 'PRAY', 'PARTY']",
  })
  reaction: string;
}
