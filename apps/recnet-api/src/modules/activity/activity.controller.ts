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
import { AuthUser, AuthOptionalUser } from "@recnet-api/utils/auth/auth.type";
import { User, UserOptional } from "@recnet-api/utils/auth/auth.user.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import {
  ZodValidationBodyPipe,
  ZodValidationQueryPipe,
} from "@recnet-api/utils/pipes/zod.validation.pipe";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import {
  getRecsFeedsParamsSchema,
  getRecsParamsSchema,
} from "@recnet/recnet-api-model";

import { GetActivitiesResponse } from "./activity.response";
import { ActivityService } from "./activity.service";
import { QueryActivitiesDto } from "./dto/query.activities.dto";

@ApiTags("activities")
@Controller("activities")
@UseFilters(RecnetExceptionFilter)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @ApiOperation({
    summary: "Get historical activities of a single user",
    description:
      "Get historical activities of a single user identified by userId with pagination.",
  })
  @ApiOkResponse({ type: GetActivitiesResponse })
  @ApiBearerAuth()
  @Get()
  @Auth()
  @UsePipes(new ZodValidationQueryPipe(getRecsParamsSchema))
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
}
