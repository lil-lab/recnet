import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ReactionType } from "@prisma/client";

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

import { Rec } from "./entities/rec.entity";
import {
  CreateRecResponse,
  GetFeedsResponse,
  GetRecResponse,
  GetRecsResponse,
  GetUpcomingRecResponse,
  UpdateRecResponse,
} from "./rec.response";

import { transformUserPreview } from "../user/user.transformer";

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

  public async getRec(recId: string): Promise<GetRecResponse> {
    const dbRec = await this.recRepository.findRecById(recId);
    return { rec: this.getRecFromDbRec(dbRec) };
  }

  public async getRecs(
    page: number,
    pageSize: number,
    userId: string,
    to: Date
  ): Promise<GetRecsResponse> {
    // validate if the user exists and is activated
    const user = await this.userRepository.findUserById(userId);
    if (!user.isActivated) {
      throw new RecnetError(
        ErrorCode.ACCOUNT_NOT_ACTIVATED,
        HttpStatus.BAD_REQUEST
      );
    }

    const filter: RecFilterBy = {
      userId: userId,
      cutoff: { to },
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
    isSelfRec: boolean,
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
    this.validateArticleInput(article, articleId);
    let articleIdToConnect: string | null = null;
    if (articleId) {
      articleIdToConnect = articleId;
    } else if (article) {
      articleIdToConnect = await this.findOrCreateArticle(article);
    }

    if (articleIdToConnect === null) {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Error getting article id while creating rec"
      );
    }
    const newRec = await this.recRepository.createRec(
      userId,
      description,
      isSelfRec,
      articleIdToConnect
    );
    return {
      rec: this.getRecFromDbRec(newRec),
    };
  }

  public async updateUpcomingRec(
    articleId: string | null,
    article: CreateArticleInput | null,
    description: string,
    isSelfRec: boolean,
    userId: string
  ): Promise<UpdateRecResponse> {
    const dbRec = await this.recRepository.findUpcomingRec(userId);
    if (!dbRec) {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.NOT_FOUND,
        "Upcoming rec not found"
      );
    }
    this.validateArticleInput(article, articleId);
    let articleIdToConnect: string | null = null;
    if (articleId) {
      articleIdToConnect = articleId;
    } else if (article) {
      articleIdToConnect = await this.findOrCreateArticle(article);
    }

    if (articleIdToConnect === null) {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Error getting article id while updating rec"
      );
    }
    let updatedRec: DbRec;
    if (articleIdToConnect === dbRec.article.id) {
      updatedRec = await this.recRepository.updateRec(
        dbRec.id,
        description,
        isSelfRec
      );
    } else {
      updatedRec = await this.recRepository.updateRec(
        dbRec.id,
        description,
        isSelfRec,
        articleIdToConnect
      );
    }
    return {
      rec: this.getRecFromDbRec(updatedRec),
    };
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

  public async createRecReaction(
    userId: string,
    recId: string,
    reaction: string
  ): Promise<void> {
    await this.validateReaction(recId, reaction);

    await this.recRepository.createRecReaction(
      userId,
      recId,
      reaction as ReactionType
    );
  }

  public async deleteRecReaction(
    userId: string,
    recId: string,
    reaction: string
  ): Promise<void> {
    await this.validateReaction(recId, reaction);

    await this.recRepository.deleteRecReaction(
      userId,
      recId,
      reaction as ReactionType
    );
  }

  private getRecsFromDbRecs(dbRec: DbRec[]): Rec[] {
    return dbRec.map(this.getRecFromDbRec);
  }

  private getRecFromDbRec(dbRec: DbRec): Rec {
    return {
      ...dbRec,
      cutoff: dbRec.cutoff.toISOString(),
      user: transformUserPreview(dbRec.user),
    };
  }

  /**
    * @param article - CreateArticleInput | null
    * @param articleId - string | null
    * @returns void

    * Article and articleId cannot be null or have value at the same time
    * Check libs/recnet-api-model/src/lib/api/rec.ts for more information
  */
  private validateArticleInput(
    article: CreateArticleInput | null,
    articleId: string | null
  ): void {
    if (!article && !articleId) {
      throw new RecnetError(
        ErrorCode.REC_UPDATE_OR_CREATE_RULE_VIOLATION,
        HttpStatus.BAD_REQUEST,
        "Article and articleId cannot be null at the same time"
      );
    }
    if (article && articleId) {
      throw new RecnetError(
        ErrorCode.REC_UPDATE_OR_CREATE_RULE_VIOLATION,
        HttpStatus.BAD_REQUEST,
        "Article and articleId cannot be set at the same time"
      );
    }
  }

  /**
   * @param article - CreateArticleInput
   * @returns articleId - string

   * Find an existing article by link or create an article in the database
   * Return the articleId of the existing or newly created article
   * Note that, due to current app design, if the article is found by the link, other fields like year, month, title of the article will not be overwritten
   */
  private async findOrCreateArticle(
    article: CreateArticleInput
  ): Promise<string> {
    let targetArticleId: string;
    const dbArticle = await this.articleRepository.findArticleByLink(
      article.link
    );
    if (dbArticle) {
      targetArticleId = dbArticle.id;
    } else {
      const newArticle = await this.articleRepository.createArticle(article);
      targetArticleId = newArticle.id;
    }
    return targetArticleId;
  }

  private async validateReaction(
    recId: string,
    reaction: string
  ): Promise<void> {
    // Check if the rec exists
    await this.recRepository.findRecById(recId);

    // Check if the reaction is valid
    if (!Object.values(ReactionType).includes(reaction as ReactionType)) {
      throw new RecnetError(
        ErrorCode.INVALID_REACTION_TYPE,
        HttpStatus.BAD_REQUEST,
        "Invalid reaction type"
      );
    }
  }
}
