import { HttpStatus, Inject, Injectable } from "@nestjs/common";

import ActivityRepository from "@recnet-api/database/repository/activity.repository";
import {
  Activity,
  ActivityFilterBy,
  Reaction as DbReaction,
} from "@recnet-api/database/repository/activity.repository.type";
import RecRepository from "@recnet-api/database/repository/rec.repository";
import { Rec as DbRec } from "@recnet-api/database/repository/rec.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { getOffset } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { getCutOff } from "@recnet/recnet-date-fns";

import { GetActivitiesResponse, GetFeedsResponse } from "./activity.response";
import { transformReaction } from "./activity.transformer";

import { transformRec } from "../rec/rec.transformer";

@Injectable()
export class ActivityService {
  constructor(
    @Inject(ActivityRepository)
    private readonly activityRepository: ActivityRepository,
    @Inject(RecRepository)
    private readonly recRepository: RecRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Get all activities (recs and reactions) for a single user
   * @param page Page number for pagination
   * @param pageSize Number of items per page
   * @param userId User ID whose activities are being fetched
   * @param to Cutoff date for activities
   * @param authUserId is the user who is making the request
   * @returns Combined activities response with pagination
   */
  public async getActivities(
    page: number,
    pageSize: number,
    userId: string,
    to: Date,
    authUserId: string | null
  ): Promise<GetActivitiesResponse> {
    // Validate if the user exists and is activated
    const user = await this.userRepository.findUserById(userId);
    if (!user.isActivated) {
      throw new RecnetError(
        ErrorCode.ACCOUNT_NOT_ACTIVATED,
        HttpStatus.BAD_REQUEST
      );
    }

    // Set up filter for activities
    const filter: ActivityFilterBy = {
      userId: userId,
      cutoff: { to },
    };

    // Get activities using the repository
    const activities = await this.activityRepository.findActivities(
      page,
      pageSize,
      filter
    );

    // Get total count for pagination
    const activityCount = await this.activityRepository.countActivities(filter);

    return {
      hasNext: activities.length + getOffset(page, pageSize) < activityCount,
      activities: activities.map((activity) => {
        if (activity.type === "rec") {
          return {
            ...activity,
            data: transformRec(activity.data as DbRec, authUserId),
          };
        } else {
          return {
            ...activity,
            data: transformReaction(activity.data as DbReaction),
          };
        }
      }),
    };
  }

  /**
   * Get feeds for a single user
   * @param page Page number for pagination
   * @param pageSize Number of items per page
   * @param cutoff Cutoff date for activities
   * @param userId User ID whose feeds are being fetched
   * @returns Combined feeds response with pagination
   */
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
    const filter: ActivityFilterBy = {
      userIds: followings,
      cutoff: new Date(cutoff),
    };
    const activityCount = await this.activityRepository.countActivities(filter);
    const activities = await this.activityRepository.findActivities(
      page,
      pageSize,
      filter
    );
    return {
      hasNext: activities.length + getOffset(page, pageSize) < activityCount,
      activities: activities.map((activity) => {
        if (activity.type === "rec") {
          return {
            ...activity,
            data: transformRec(activity.data as DbRec, userId),
          };
        } else {
          return {
            ...activity,
            data: transformReaction(activity.data as DbReaction),
          };
        }
      }),
    };
  }
}
