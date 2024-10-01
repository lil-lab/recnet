import { Controller, UseFilters, Get, UsePipes, Query } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationQueryPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { getDigitalLibrariesParamsSchema } from "@recnet/recnet-api-model";

import { DigitalLibraryAdminService } from "./digital-library.admin.service";
import { GetDigitalLibrariesResponse } from "./digital-library.response";
import { QueryDigitalLibraryDto } from "./dto/query.digital-library.dto";

@ApiTags("digital-libraries")
@Controller("digital-libraries")
@UseFilters(RecnetExceptionFilter)
export class DigitalLibraryController {
  constructor(
    private readonly digitalLibraryAdminService: DigitalLibraryAdminService
  ) {}

  @ApiOperation({
    summary: "Get Digital Library ",
    description:
      "Get digital library data. If query id and name is not provided, it will return all digital library data.",
  })
  @ApiOkResponse({ type: GetDigitalLibrariesResponse })
  @ApiBearerAuth()
  @Get()
  @Auth({ allowedRoles: ["ADMIN"] })
  @UsePipes(new ZodValidationQueryPipe(getDigitalLibrariesParamsSchema))
  public async getDigitalLibraries(
    @Query() dto: QueryDigitalLibraryDto
  ): Promise<GetDigitalLibrariesResponse> {
    return this.digitalLibraryAdminService.getDigitalLibraries(dto);
  }
}
