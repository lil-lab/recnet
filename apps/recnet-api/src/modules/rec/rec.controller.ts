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
  Param,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { Auth, AuthOptional } from "@recnet-api/utils/auth/auth.decorator";
import { AuthUser, AuthOptionalUser } from "@recnet-api/utils/auth/auth.type";
import { User, UserOptional } from "@recnet-api/utils/auth/auth.user.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import {
  ZodValidationBodyPipe,
  ZodValidationQueryPipe,
} from "@recnet-api/utils/pipes/zod.validation.pipe";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import {
  deleteRecReactionParamsSchema,
  getRecsFeedsParamsSchema,
  getRecsParamsSchema,
  patchRecsUpcomingRequestSchema,
  postRecsReactionsRequestSchema,
  postRecsUpcomingRequestSchema,
} from "@recnet/recnet-api-model";

import { CreateRecDto } from "./dto/create.rec.dto";
import { CreateRecReactionDto } from "./dto/create.rec.reaction.dto";
import { DeleteRecReactionDto } from "./dto/delete.rec.reaction.dto";
import { QueryFeedsDto } from "./dto/query.feeds.dto";
import { QueryRecsDto } from "./dto/query.recs.dto";
import { UpdateRecDto } from "./dto/update.rec.dto";
import {
  CreateRecResponse,
  GetFeedsResponse,
  GetRecResponse,
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
    summary: "Get a single rec",
    description: "Get a single rec by id.",
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: GetRecResponse })
  @Get("rec/:id")
  @AuthOptional()
  public async getRec(
    @Param("id") id: string,
    @UserOptional() authUser: AuthOptionalUser
  ): Promise<GetRecResponse> {
    const authUserId = authUser ? authUser.userId : null;
    return this.recService.getRec(id, authUserId);
  }

  @ApiOperation({
    summary: "Get recs",
    description: "Get historical recs by userId with pagination.",
  })
  @ApiOkResponse({ type: GetRecsResponse })
  @ApiBearerAuth()
  @Get()
  @AuthOptional()
  @UsePipes(new ZodValidationQueryPipe(getRecsParamsSchema))
  public async getRecs(
    @Query() dto: QueryRecsDto,
    @UserOptional() authUser: AuthOptionalUser
  ): Promise<GetRecsResponse> {
    const { page, pageSize, userId } = dto;
    const authUserId = authUser ? authUser.userId : null;

    // Get the Recs to current date to avoid upcoming rec from showing in a user's profile page
    const to = new Date();
    return this.recService.getRecs(page, pageSize, userId, to, authUserId);
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
  @UsePipes(new ZodValidationBodyPipe(postRecsUpcomingRequestSchema))
  public async createUpcomingRec(
    @Body() body: CreateRecDto,
    @User() authUser: AuthUser
  ): Promise<CreateRecResponse> {
    const { userId } = authUser;
    return this.recService.addRec(
      body.articleId,
      body.article,
      body.description,
      body.isSelfRec,
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
  @UsePipes(new ZodValidationBodyPipe(patchRecsUpcomingRequestSchema))
  public async updateUpcomingRec(
    @Body() body: UpdateRecDto,
    @User() authUser: AuthUser
  ): Promise<UpdateRecResponse> {
    const { userId } = authUser;
    return this.recService.updateUpcomingRec(
      body.articleId,
      body.article,
      body.description,
      body.isSelfRec,
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

  @ApiOperation({
    summary: "Create a rec reaction",
    description: "Create a rec reaction.",
  })
  @ApiBearerAuth()
  @Post(":id/reactions")
  @Auth()
  @UsePipes(new ZodValidationBodyPipe(postRecsReactionsRequestSchema))
  public async createRecReaction(
    @Param("id") recId: string,
    @Body() body: CreateRecReactionDto,
    @User() authUser: AuthUser
  ): Promise<void> {
    const { userId } = authUser;
    return this.recService.createRecReaction(userId, recId, body.reaction);
  }

  @ApiOperation({
    summary: "Delete a rec reaction",
    description: "Delete a rec reaction.",
  })
  @ApiBearerAuth()
  @Delete(":id/reactions")
  @Auth()
  @UsePipes(new ZodValidationQueryPipe(deleteRecReactionParamsSchema))
  public async deleteRecReaction(
    @Param("id") recId: string,
    @Query() dto: DeleteRecReactionDto,
    @User() authUser: AuthUser
  ): Promise<void> {
    const { userId } = authUser;
    return this.recService.deleteRecReaction(userId, recId, dto.reaction);
  }
}
