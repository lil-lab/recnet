import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import RecRepository from "@recnet-api/database/repository/rec.repository";
import { Rec as DbRec } from "@recnet-api/database/repository/rec.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { getOffset } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { getNextCutOff } from "@recnet/recnet-date-fns";

import { CreateArticleDto } from "./dto/create.rec.dto";
import { UpdateArticleDto } from "./dto/update.rec.dto";
import { Rec } from "./entities/rec.entity";
import {
  CreateRecResponse,
  GetArticleByLinkResponse,
  GetFeedsResponse,
  GetRecsResponse,
  GetUpcomingRecResponse,
  UpdateRecResponse,
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

  public async addRec(
    articleId: string | null,
    article: CreateArticleDto | null,
    description: string,
    userId: string
  ): Promise<CreateRecResponse> {
    // article and articleId cannot be null at the same time
    // check libs/recnet-api-model/src/lib/api/rec.ts
    if (!article && !articleId) {
      // which code should be returned?
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.BAD_REQUEST,
        "Article and articleId cannot be null at the same time"
      );
    } else if (!article && articleId) {
      // insert rec to db
      const rec = await this.recRepository.createRec({
        user: {
          connect: {
            id: userId,
          },
        },
        cutoff: getNextCutOff(),
        description: description,
        article: {
          connect: {
            id: articleId,
          },
        },
      });
      return {
        rec: this.getRecFromDbRec(rec),
      };
    } else if (article && !articleId) {
      // insert article and rec to db
      const rec = await this.recRepository.createRec({
        user: {
          connect: {
            id: userId,
          },
        },
        cutoff: getNextCutOff(),
        description: description,
        article: {
          create: {
            ...article,
          },
        },
      });
      return {
        rec: this.getRecFromDbRec(rec),
      };
    }
    throw new RecnetError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      HttpStatus.BAD_REQUEST,
      "Article and articleId cannot have value at the same time"
    );
  }

  public async updateUpcomingRec(
    articleId: string | null,
    article: UpdateArticleDto | null,
    description: string,
    userId: string
  ): Promise<UpdateRecResponse> {
    const dbRec = await this.recRepository.findUpcomingRec(userId);
    if (!dbRec) {
      // which code should be returned?
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.NOT_FOUND,
        "Upcoming rec not found"
      );
    }
    if (!article && !articleId) {
      // article and articleId cannot be null at the same time
      // check libs/recnet-api-model/src/lib/api/rec.ts
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.BAD_REQUEST,
        "Article and articleId cannot be null at the same time"
      );
    } else if (article && articleId) {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.BAD_REQUEST,
        "Article and articleId cannot have value at the same time"
      );
    }
    throw new Error("TODO: finish this function");
  }

  public async deleteUpcomingRec(userId: string): Promise<void> {
    // get upcoming rec
    const rec = await this.recRepository.findUpcomingRec(userId);
    if (!rec) {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.NOT_FOUND,
        "Upcoming rec not found"
      );
    }
    await this.recRepository.deleteUpcomingRec(rec.id);
  }

  public async getArticleByLink(
    link: string
  ): Promise<GetArticleByLinkResponse> {
    const article = await this.recRepository.findArticleByLink(link);
    if (!article) {
      return {
        article: null,
      };
    }
    return {
      article: article,
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
