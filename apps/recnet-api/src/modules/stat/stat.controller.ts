import {
  Controller,
  UseFilters,
  Get,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";

import { QueryStatResponse, QueryPeriodStatResponse } from "./stat.response";
import { StatService } from "./stat.service";

@ApiTags("stats")
@Controller("stats")
@UseFilters(RecnetExceptionFilter)
export class StatController {
  constructor(private readonly statService: StatService) {}

  @ApiOperation({
    summary: "Get Stats",
    description: "Get all stats related to user & rec data",
  })
  @ApiOkResponse({ type: QueryStatResponse })
  @ApiBearerAuth()
  @Get()
  @Auth({ allowedRoles: ["ADMIN"] })
  public async getStats(): Promise<QueryStatResponse> {
    return this.statService.getStats();
  }

  @ApiOperation({
    summary: "Get Period Stats",
    description: "Get detailed recommendations for a specific time period",
  })
  @ApiOkResponse({ type: QueryPeriodStatResponse })
  @ApiBearerAuth()
  @Get("period/:timestamp")
  @Auth({ allowedRoles: ["ADMIN"] })
  public async getPeriodStats(
    @Param("timestamp", ParseIntPipe) timestamp: number
  ): Promise<QueryPeriodStatResponse> {
    return this.statService.getPeriodStats(timestamp);
  }
}
