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

import { GetReactionsResponse } from "./activities.response";
import { ActivitiesService } from "./activities.service";
import { QueryMyReactionsDto } from "./dto/query.my-reactions.dto";
import { QueryNetworkReactionsDto } from "./dto/query.network-reactions.dto";

@ApiTags("activities")
@Controller("activities")
@UseFilters(RecnetExceptionFilter)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @ApiOperation({
    summary: "Get reactions for a single user by userId with pagination.",
    description: "Get historical reactions by userId with pagination.",
  })
  @ApiOkResponse({ type: GetReactionsResponse })
  @ApiBearerAuth()
  @Get("reactions/me")
  @Auth()
  @UsePipes(new ZodValidationQueryPipe(getRecsParamsSchema))
  public async getMyReactions(
    @Query() dto: QueryMyReactionsDto,
    @User() authUser: AuthUser
  ): Promise<GetReactionsResponse> {
    const { page, pageSize } = dto;
    const { userId } = authUser;

    // Get the Reactions made by the user referenced by userId to current date
    const to = new Date();
    return this.activitiesService.getMyReactions(page, pageSize, userId, to);
  }

  @ApiOperation({
    summary: "Get reactions of the user's following users",
    description: "Get reactions of the user's following users with pagination.",
  })
  @ApiOkResponse({ type: GetReactionsResponse })
  @ApiBearerAuth()
  @Get("reactions/following")
  @Auth()
  @UsePipes(new ZodValidationQueryPipe(getRecsFeedsParamsSchema))
  public async getNetworkReactions(
    @Query() dto: QueryNetworkReactionsDto,
    @User() authUser: AuthUser
  ): Promise<GetReactionsResponse> {
    const { page, pageSize, ...rest } = dto;
    const { userId } = authUser;
    const cutoff = rest?.cutoff ?? getLatestCutOff().getTime();
    return this.activitiesService.getNetworkReactions(
      page,
      pageSize,
      cutoff,
      userId
    );
  }
}
