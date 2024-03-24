import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import RecRepository from "@recnet-api/database/repository/rec.repository";
import { Rec as DbRec } from "@recnet-api/database/repository/rec.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { getOffset } from "@recnet-api/utils";

import { Rec } from "./entities/rec.entity";
import {
  GetFeedsResponse,
  GetRecsResponse,
  GetUpcomingRecResponse,
} from "./rec.response";

@Injectable()
export class RecService {
  constructor(
    @Inject(RecRepository)
    private readonly recRepository: RecRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  public async getRecs(
    page: number,
    pageSize: number,
    userId: string
  ): Promise<GetRecsResponse> {
    const recCount = await this.recRepository.countRecs({
      userId: userId,
    });
    const dbRecs = await this.recRepository.findRecs(page, pageSize, {
      userId: userId,
    });
    const recs = this.getRecsFromDbRecs(dbRecs);

    return {
      hasNext: recs.length + getOffset(page, pageSize) < recCount,
      recs: recs,
    };
  }

  public async getFeeds(
    page: number,
    pageSize: number,
    cutoff: number,
    userId: string
  ): Promise<GetFeedsResponse> {
    const user = await this.userRepository.getUser(userId);
    const followings = user.following.map((following) => following.followingId);
    const where: Prisma.RecommendationWhereInput = {
      userId: {
        in: followings,
      },
      cutoff: new Date(cutoff),
    };
    const recCount = await this.recRepository.countRecs(where);
    const dbRecs = await this.recRepository.findRecs(page, pageSize, where);
    const recs = this.getRecsFromDbRecs(dbRecs);

    return {
      hasNext: recs.length + getOffset(page, pageSize) < recCount,
      recs: recs,
    };
  }

  public async getUpcomingRec(userId: string): Promise<GetUpcomingRecResponse> {
    const dbRec = await this.recRepository.findUpcomingRec(userId);
    if (!dbRec) {
      return {
        rec: null,
      };
    }
    return {
      rec: this.getRecFromDbRec(dbRec),
    };
  }

  private getRecsFromDbRecs(dbRec: DbRec[]): Rec[] {
    return dbRec.map(this.getRecFromDbRec);
  }

  private getRecFromDbRec(dbRec: DbRec): Rec {
    return {
      ...dbRec,
      cutoff: dbRec.cutoff.toISOString(),
      user: {
        id: dbRec.user.id,
        handle: dbRec.user.handle,
        displayName: dbRec.user.displayName,
        photoUrl: dbRec.user.photoUrl,
        affiliation: dbRec.user.affiliation,
        bio: dbRec.user.bio,
        numFollowers: dbRec.user.followedBy.length,
      },
    };
  }
}
