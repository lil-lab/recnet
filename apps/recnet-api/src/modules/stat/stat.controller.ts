import {
  Controller,
  UseFilters,
  Get,
  Query,
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

import { QueryStatResponse, GetStatsRecsResponse } from "./stat.response";
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
    summary: "Get Recs Stats",
    description: "Get all recs within a week before the cutoff date",
  })
  @ApiOkResponse({ type: GetStatsRecsResponse })
  @ApiBearerAuth()
  @Get("recs")
  @Auth({ allowedRoles: ["ADMIN"] })
  public async getStatsRecs(
    @Query("cutoff", ParseIntPipe) cutoff: number
  ): Promise<GetStatsRecsResponse> {
    return this.statService.getStatsRecs(cutoff);
  }
}
