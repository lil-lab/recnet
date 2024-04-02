import { HttpStatus, Injectable } from "@nestjs/common";
import { FollowingRecord } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

@Injectable()
export default class FollowingRecordRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async createFollowingRecord(
    userId: string,
    followingUserId: string
  ): Promise<FollowingRecord> {
    try {
      return await this.prisma.followingRecord.create({
        data: {
          followedById: userId,
          followingId: followingUserId,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined;
      throw new RecnetError(
        ErrorCode.DB_UNKNOWN_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage
      );
    }
  }

  public async deleteFollowingRecord(
    userId: string,
    followingUserId: string
  ): Promise<FollowingRecord> {
    try {
      return await this.prisma.followingRecord.delete({
        where: {
          followingId_followedById: {
            followedById: userId,
            followingId: followingUserId,
          },
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined;
      throw new RecnetError(
        ErrorCode.DB_UNKNOWN_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage
      );
    }
  }
}
