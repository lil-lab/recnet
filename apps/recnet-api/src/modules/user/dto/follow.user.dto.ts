import { ApiProperty } from "@nestjs/swagger";

export class FollowUserDto {
  @ApiProperty({
    description: "The user's id(uuid) the current user wants to follow.",
    example: "2bc2e909-4400-4e7e-8873-c20bfb65a0f9",
  })
  userId: string;
}

export class UnfollowUserDto {
  @ApiProperty({
    description: "The user's id(uuid) the current user wants to unfollow.",
    example: "2bc2e909-4400-4e7e-8873-c20bfb65a0f9",
  })
  userId: string;
}
