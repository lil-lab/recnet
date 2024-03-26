import { HttpStatus, Inject, Injectable } from "@nestjs/common";

import ArticleRepository from "@recnet-api/database/repository/article.repository";
import { CreateArticleInput } from "@recnet-api/database/repository/article.repository.type";
import RecRepository from "@recnet-api/database/repository/rec.repository";
import {
  Rec as DbRec,
  RecFilterBy,
} from "@recnet-api/database/repository/rec.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { getOffset } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { getCutOff } from "@recnet/recnet-date-fns";

import { UpdateArticleDto } from "./dto/update.rec.dto";
import { Rec } from "./entities/rec.entity";
import {
  CreateRecResponse,
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
    private readonly userRepository: UserRepository,
    @Inject(ArticleRepository)
    private readonly articleRepository: ArticleRepository
  ) {}

  public async getRecs(
    page: number,
    pageSize: number,
    userId: string
  ): Promise<GetRecsResponse> {
    const filter: RecFilterBy = {
      userId: userId,
    };
    const recCount = await this.recRepository.countRecs(filter);
    const dbRecs = await this.recRepository.findRecs(page, pageSize, filter);
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
    if (cutoff !== getCutOff(new Date(cutoff)).getTime()) {
      throw new RecnetError(ErrorCode.INVALID_CUTOFF, HttpStatus.BAD_REQUEST);
    }
    const user = await this.userRepository.findUserById(userId);
    const followings = user.following.map((following) => following.followingId);
    const filter: RecFilterBy = {
      userIds: followings,
      cutoff: new Date(cutoff),
    };
    const recCount = await this.recRepository.countRecs(filter);
    const dbRecs = await this.recRepository.findRecs(page, pageSize, filter);
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
    article: CreateArticleInput | null,
    description: string,
    userId: string
  ): Promise<CreateRecResponse> {
    const dbRec = await this.recRepository.findUpcomingRec(userId);
    if (dbRec) {
      throw new RecnetError(
        ErrorCode.REC_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
        "Upcoming rec already exists"
      );
    }
    // article and articleId cannot be null at the same time
    // check libs/recnet-api-model/src/lib/api/rec.ts
    if (!article && !articleId) {
      // which code should be returned?
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.BAD_REQUEST,
        "Article and articleId cannot be null at the same time"
      );
    }

    let checkArticleId: string | null = null;
    if (article) {
      if (articleId) {
        throw new RecnetError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          HttpStatus.BAD_REQUEST,
          "Article and articleId cannot have value at the same time"
        );
      }
      // check if article already exists
      const dbArticle = await this.articleRepository.findArticleByLink(
        article.link
      );
      if (dbArticle) {
        checkArticleId = dbArticle.id;
      } else {
        // create new article
        const newArticle = await this.articleRepository.createArticle(article);
        checkArticleId = newArticle.id;
      }
    }

    // create new rec
    const targetArticleId = articleId ? articleId : checkArticleId;
    if (targetArticleId === null) {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Error getting article id while creating rec"
      );
    }
    const newRec = await this.recRepository.createRec(
      userId,
      description,
      targetArticleId
    );
    return {
      rec: this.getRecFromDbRec(newRec),
    };
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
    } else if (article && !articleId) {
      // update rec and create new article
      const updatedRec = await this.recRepository.updateRec(dbRec.id, {
        description: description,
        article: {
          create: {
            ...article,
          },
        },
      });
      return {
        rec: this.getRecFromDbRec(updatedRec),
      };
    } else if (articleId && !article) {
      // check if articleId is the same as dbRec.article.id
      // if not, update rec and link to another article using articleId
      // if the same, update rec
      if (articleId !== dbRec.article.id) {
        const updatedRec = await this.recRepository.updateRec(dbRec.id, {
          description: description,
          article: {
            connect: {
              id: articleId,
            },
          },
        });
        return {
          rec: this.getRecFromDbRec(updatedRec),
        };
      } else {
        const updatedRec = await this.recRepository.updateRec(dbRec.id, {
          description: description,
        });
        return {
          rec: this.getRecFromDbRec(updatedRec),
        };
      }
    }
    throw new RecnetError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      HttpStatus.BAD_REQUEST,
      "Article and articleId cannot have value at the same time"
    );
  }

  public async deleteUpcomingRec(userId: string): Promise<void> {
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
