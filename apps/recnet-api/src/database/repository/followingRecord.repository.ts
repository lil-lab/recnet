import { Injectable } from "@nestjs/common";
import { FollowingRecord } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";

@Injectable()
export default class FollowingRecordRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async createFollowingRecord(
    userId: string,
    followingUserId: string
  ): Promise<FollowingRecord> {
    return this.prisma.followingRecord.create({
      data: {
        followedById: userId,
        followingId: followingUserId,
      },
    });
  }

  public async deleteFollowingRecord(
    userId: string,
    followingUserId: string
  ): Promise<FollowingRecord> {
    return this.prisma.followingRecord.delete({
      where: {
        followingId_followedById: {
          followedById: userId,
          followingId: followingUserId,
        },
      },
    });
  }
}
