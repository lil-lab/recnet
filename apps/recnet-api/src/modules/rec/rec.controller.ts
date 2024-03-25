import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { getRecnetJWTPayloadFromReq } from "@recnet-api/utils/getJWTPayloadFromReq";
import { AuthGuard } from "@recnet-api/utils/guards/auth.guard";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import {
  getArticlesParamsSchema,
  getRecsFeedsParamsSchema,
  getRecsParamsSchema,
  getRecsUpcomingResponseSchema,
  patchRecsUpcomingRequestSchema,
  postRecsUpcomingRequestSchema,
} from "@recnet/recnet-api-model";

import { CreateRecDto } from "./dto/create.rec.dto";
import { QueryArticleDto } from "./dto/query.article.dto";
import { QueryFeedsDto } from "./dto/query.feeds.dto";
import { QueryRecsDto } from "./dto/query.recs.dto";
import { UpdateRecDto } from "./dto/update.rec.dto";
import {
  CreateRecResponse,
  GetArticleByLinkResponse,
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
  @Get()
  @UseGuards(AuthGuard("RecNetJWT"))
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
  @Get("feeds")
  @UseGuards(AuthGuard("RecNetJWT"))
  @UsePipes(new ZodValidationPipe(getRecsFeedsParamsSchema))
  public async getFeeds(
    @Query() dto: QueryFeedsDto,
    @Req() req: Request
  ): Promise<GetFeedsResponse> {
    const { page, pageSize, ...rest } = dto;
    const cutoff = rest?.cutoff ?? getLatestCutOff().getTime();
    const jwtPayload = getRecnetJWTPayloadFromReq(req);
    return this.recService.getFeeds(
      page,
      pageSize,
      cutoff,
      jwtPayload.recnet.userId
    );
  }

  @ApiOperation({
    summary: "Get upcoming rec",
    description: "Get upcoming rec using userId in JWT.",
  })
  @ApiOkResponse({ type: GetUpcomingRecResponse })
  @Get("upcoming")
  @UseGuards(AuthGuard("RecNetJWT"))
  @UsePipes(new ZodValidationPipe(getRecsUpcomingResponseSchema))
  public async getUpcomingRec(
    @Req() req: Request
  ): Promise<GetUpcomingRecResponse> {
    const jwtPayload = getRecnetJWTPayloadFromReq(req);
    return this.recService.getUpcomingRec(jwtPayload.recnet.userId);
  }

  @ApiOperation({
    summary: "Create new rec",
    description: "Create new rec using userId in JWT.",
  })
  @ApiOkResponse({ type: CreateRecResponse })
  @Post("upcoming")
  @UseGuards(AuthGuard("RecNetJWT"))
  @UsePipes(new ZodValidationPipe(postRecsUpcomingRequestSchema))
  public async createUpcomingRec(
    @Req() req: Request,
    @Body() body: CreateRecDto
  ): Promise<CreateRecResponse> {
    const jwtPayload = getRecnetJWTPayloadFromReq(req);
    return this.recService.addRec(
      body.articleId,
      body.article,
      body.description,
      jwtPayload.recnet.userId
    );
  }

  @ApiOperation({
    summary: "Edit upcoming rec",
    description: "Edit upcoming rec.",
  })
  @ApiOkResponse({ type: UpdateRecResponse })
  @Patch("upcoming")
  @UseGuards(AuthGuard("RecNetJWT"))
  @UsePipes(new ZodValidationPipe(patchRecsUpcomingRequestSchema))
  public async updateUpcomingRec(
    @Req() req: Request,
    @Body() body: UpdateRecDto
  ): Promise<void> {
    const jwtPayload = getRecnetJWTPayloadFromReq(req);
    // TODO: Implement update
    return;
  }

  @ApiOperation({
    summary: "Delete upcoming rec",
    description: "Delete upcoming rec.",
  })
  @Delete("upcoming")
  @UseGuards(AuthGuard("RecNetJWT"))
  public async deleteUpcomingRec(@Req() req: Request): Promise<void> {
    const jwtPayload = getRecnetJWTPayloadFromReq(req);
    return this.recService.deleteUpcomingRec(jwtPayload.recnet.userId);
  }

  @ApiOperation({
    summary: "Get Article By Link",
    description: "Get article by link.",
  })
  @ApiOkResponse({ type: GetArticleByLinkResponse })
  @Get("articles")
  @UseGuards(AuthGuard("RecNetJWT"))
  @UsePipes(new ZodValidationPipe(getArticlesParamsSchema))
  public async getArticleByLink(
    @Query() dto: QueryArticleDto
  ): Promise<GetArticleByLinkResponse> {
    const { link } = dto;
    return this.recService.getArticleByLink(link);
  }
}
