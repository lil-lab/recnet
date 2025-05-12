import {
  Body,
  Controller,
  Get,
  Query,
  UseFilters,
  UsePipes,
  Param,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { AuthUser } from "@recnet-api/utils/auth/auth.type";
import { User } from "@recnet-api/utils/auth/auth.user.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import {
  ZodValidationBodyPipe,
  ZodValidationQueryPipe,
} from "@recnet-api/utils/pipes/zod.validation.pipe";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import {
  getRecsFeedsParamsSchema,
  getRecsParamsSchema,
  getActivitiesParamsSchema,
} from "@recnet/recnet-api-model";

import { GetActivitiesResponse, GetFeedsResponse } from "./activity.response";
import { ActivityService } from "./activity.service";
import { QueryActivitiesDto } from "./dto/query.activities.dto";
import { QueryFeedsDto } from "./dto/query.feeds.dto";

@ApiTags("activities")
@Controller("activities")
@UseFilters(RecnetExceptionFilter)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @ApiOperation({
    summary: "Get activities of a user",
    description:
      "Get historical activities of a single user identified by userId with pagination.",
  })
  @ApiOkResponse({ type: GetActivitiesResponse })
  @ApiBearerAuth()
  @Get()
  @Auth()
  @UsePipes(new ZodValidationQueryPipe(getActivitiesParamsSchema))
  public async getActivities(
    @Query() dto: QueryActivitiesDto,
    @User() authUser: AuthUser
  ): Promise<GetActivitiesResponse> {
    const { page, pageSize, userId } = dto;
    const authUserId = authUser?.userId ?? null;

    // Get the Reactions made by the user referenced by userId to current date
    const to = new Date();
    return this.activityService.getActivities(
      page,
      pageSize,
      userId,
      to,
      authUserId
    );
  }

  @ApiOperation({
    summary: "Get feeds",
    description: "Get feeds by userId with pagination.",
  })
  @ApiOkResponse({ type: GetFeedsResponse })
  @ApiBearerAuth()
  @Get("feeds")
  @Auth()
  @UsePipes(new ZodValidationQueryPipe(getRecsFeedsParamsSchema))
  public async getFeeds(
    @Query() dto: QueryFeedsDto,
    @User() authUser: AuthUser
  ): Promise<GetFeedsResponse> {
    const { page, pageSize, ...rest } = dto;
    const cutoff = rest?.cutoff ?? getLatestCutOff().getTime();
    const { userId } = authUser;
    return this.activityService.getFeeds(page, pageSize, cutoff, userId);
  }
}
