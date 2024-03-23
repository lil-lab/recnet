import { Controller, Get, Query, UseFilters, UsePipes } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { getRecsParamsSchema } from "@recnet/recnet-api-model";

import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { QueryRecsDto } from "./dto/query.recs.dto";
import { GetRecsResponse } from "./rec.response";
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
  @UsePipes(new ZodValidationPipe(getRecsParamsSchema))
  public async getRecs(@Query() dto: QueryRecsDto): Promise<GetRecsResponse> {
    const { page, pageSize, userId } = dto;
    return this.recService.getRecs(page, pageSize, userId);
  }
}
