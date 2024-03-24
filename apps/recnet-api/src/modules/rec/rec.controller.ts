import {
  Controller,
  Get,
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
  getRecsFeedsParamsSchema,
  getRecsParamsSchema,
  getRecsUpcomingResponseSchema,
} from "@recnet/recnet-api-model";

import { QueryFeedsDto } from "./dto/query.feeds.dto";
import { QueryRecsDto } from "./dto/query.recs.dto";
import {
  GetFeedsResponse,
  GetRecsResponse,
  GetUpcomingRecResponse,
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
}
