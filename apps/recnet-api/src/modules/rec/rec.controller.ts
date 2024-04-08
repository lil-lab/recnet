import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseFilters,
  UsePipes,
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
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import {
  getRecsFeedsParamsSchema,
  getRecsParamsSchema,
  getRecsUpcomingResponseSchema,
  patchRecsUpcomingRequestSchema,
  postRecsUpcomingRequestSchema,
} from "@recnet/recnet-api-model";

import { CreateRecDto } from "./dto/create.rec.dto";
import { QueryFeedsDto } from "./dto/query.feeds.dto";
import { QueryRecsDto } from "./dto/query.recs.dto";
import { UpdateRecDto } from "./dto/update.rec.dto";
import {
  CreateRecResponse,
  GetFeedsResponse,
  GetRecsResponse,
  GetUpcomingRecResponse,
  UpdateRecResponse,
} from "./rec.response";
import { RecService } from "./rec.service";

@ApiTags("recs")
@Controller("recs")
@UseFilters(RecnetExceptionFilter)
export class RecController {
  constructor(private readonly recService: RecService) {}

  @ApiOperation({
    summary: "Get recs",
    description: "Get historical recs by userId with pagination.",
  })
  @ApiOkResponse({ type: GetRecsResponse })
  @ApiBearerAuth()
  @Get()
  @UsePipes(new ZodValidationPipe(getRecsParamsSchema))
  public async getRecs(@Query() dto: QueryRecsDto): Promise<GetRecsResponse> {
    const { page, pageSize, userId } = dto;
    return this.recService.getRecs(page, pageSize, userId);
  }

  @ApiOperation({
    summary: "Get feeds",
    description: "Get feeds by userId with pagination.",
  })
  @ApiOkResponse({ type: GetFeedsResponse })
  @ApiBearerAuth()
  @Get("feeds")
  @Auth()
  @UsePipes(new ZodValidationPipe(getRecsFeedsParamsSchema))
  public async getFeeds(
    @Query() dto: QueryFeedsDto,
    @User() authUser: AuthUser
  ): Promise<GetFeedsResponse> {
    const { page, pageSize, ...rest } = dto;
    const cutoff = rest?.cutoff ?? getLatestCutOff().getTime();
    const { userId } = authUser;
    return this.recService.getFeeds(page, pageSize, cutoff, userId);
  }

  @ApiOperation({
    summary: "Get upcoming rec",
    description: "Get upcoming rec using userId in JWT.",
  })
  @ApiOkResponse({ type: GetUpcomingRecResponse })
  @ApiBearerAuth()
  @Get("upcoming")
  @Auth()
  @UsePipes(new ZodValidationPipe(getRecsUpcomingResponseSchema))
  public async getUpcomingRec(
    @User() authUser: AuthUser
  ): Promise<GetUpcomingRecResponse> {
    const { userId } = authUser;
    return this.recService.getUpcomingRec(userId);
  }

  @ApiOperation({
    summary: "Create new rec",
    description: "Create new rec using userId in JWT.",
  })
  @ApiOkResponse({ type: CreateRecResponse })
  @ApiBearerAuth()
  @Post("upcoming")
  @Auth()
  @UsePipes(new ZodValidationPipe(postRecsUpcomingRequestSchema))
  public async createUpcomingRec(
    @Body() body: CreateRecDto,
    @User() authUser: AuthUser
  ): Promise<CreateRecResponse> {
    const { userId } = authUser;
    return this.recService.addRec(
      body.articleId,
      body.article,
      body.description,
      userId
    );
  }

  @ApiOperation({
    summary: "Edit upcoming rec",
    description: "Edit upcoming rec.",
  })
  @ApiOkResponse({ type: UpdateRecResponse })
  @ApiBearerAuth()
  @Patch("upcoming")
  @Auth()
  @UsePipes(new ZodValidationPipe(patchRecsUpcomingRequestSchema))
  public async updateUpcomingRec(
    @Body() body: UpdateRecDto,
    @User() authUser: AuthUser
  ): Promise<UpdateRecResponse> {
    const { userId } = authUser;
    return this.recService.updateUpcomingRec(
      body.articleId,
      body.article,
      body.description,
      userId
    );
  }

  @ApiOperation({
    summary: "Delete upcoming rec",
    description: "Delete upcoming rec.",
  })
  @ApiBearerAuth()
  @Delete("upcoming")
  @Auth()
  public async deleteUpcomingRec(@User() authUser: AuthUser): Promise<void> {
    const { userId } = authUser;
    return this.recService.deleteUpcomingRec(userId);
  }
}
