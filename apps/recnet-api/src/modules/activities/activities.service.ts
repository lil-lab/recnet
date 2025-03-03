import { HttpStatus, Inject, Injectable } from "@nestjs/common";

import ReactionRepository from "@recnet-api/database/repository/reaction.repository";
import {
  Reaction as DbReaction,
  ReactionFilterBy,
} from "@recnet-api/database/repository/reaction.repository.type";
import RecRepository from "@recnet-api/database/repository/rec.repository";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { getOffset } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { getCutOff } from "@recnet/recnet-date-fns";

import { GetReactionsResponse } from "./activities.response";
import { transformReaction } from "./reaction.transformer";

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(RecRepository)
    private readonly recRepository: RecRepository,
    @Inject(ReactionRepository)
    private readonly reactionRepository: ReactionRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  /**
   * @param userId is the user id of the user whose reactions are being fetched
   * @param authUserId is the user id of the user who is making the request
   */
  // get reactions of a single user
  public async getMyReactions(
    page: number,
    pageSize: number,
    userId: string,
    to: Date
  ): Promise<GetReactionsResponse> {
    // validate if the user exists and is activated
    const user = await this.userRepository.findUserById(userId);
    if (!user.isActivated) {
      throw new RecnetError(
        ErrorCode.ACCOUNT_NOT_ACTIVATED,
        HttpStatus.BAD_REQUEST
      );
    }

    const filter: ReactionFilterBy = {
      userId: userId,
      cutoff: { to },
    };
    const reactionCount = await this.reactionRepository.countReactions(filter);
    const dbReactions = await this.reactionRepository.findReactions(
      page,
      pageSize,
      filter
    );
    const reactions = dbReactions.map((dbReaction) =>
      transformReaction(dbReaction)
    );

    return {
      hasNext: reactions.length + getOffset(page, pageSize) < reactionCount,
      reactions: reactions,
    };
  }

  /**
   * @param cutoff is the cutoff time of the reactions to be fetched
   * @param userId is the user id of the user whose reactions are being fetched
   */
  // get reactions of all users followed by the single user referenced by userId
  public async getNetworkReactions(
    page: number,
    pageSize: number,
    cutoff: number,
    userId: string
  ): Promise<GetReactionsResponse> {
    if (cutoff !== getCutOff(new Date(cutoff)).getTime()) {
      throw new RecnetError(ErrorCode.INVALID_CUTOFF, HttpStatus.BAD_REQUEST);
    }
    // get all users followed by the current user
    const user = await this.userRepository.findUserById(userId);
    const followings = user.following.map((following) => following.followingId);
    const filter: ReactionFilterBy = {
      userIds: followings,
      cutoff: { to: new Date(cutoff) },
    };
    const reactionCount = await this.reactionRepository.countReactions(filter);
    const dbReactions = await this.reactionRepository.findReactions(
      page,
      pageSize,
      filter
    );
    const reactions = dbReactions.map((dbReaction) =>
      transformReaction(dbReaction)
    );

    return {
      hasNext: reactions.length + getOffset(page, pageSize) < reactionCount,
      reactions: reactions,
    };
  }
}
