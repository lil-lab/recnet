import {
  Controller,
  UseFilters,
  Get,
  UsePipes,
  Query,
  Body,
  Post,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import {
  ZodValidationBodyPipe,
  ZodValidationQueryPipe,
} from "@recnet-api/utils/pipes/zod.validation.pipe";

import {
  getDigitalLibrariesParamsSchema,
  postDigitalLibrariesRequestSchema,
} from "@recnet/recnet-api-model";

import { DigitalLibraryAdminService } from "./digital-library.admin.service";
import { GetDigitalLibrariesResponse } from "./digital-library.response";
import { CreateDigitalLibraryDto } from "./dto/create.digital-library.dto";
import { QueryDigitalLibraryDto } from "./dto/query.digital-library.dto";
import { DigitalLibrary } from "./entities/digital-library.entity";

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

  @ApiOperation({
    summary: "Create Digital Library",
    description:
      "Create digital library. After creating, need engineer to add related service in backend.",
  })
  @ApiOkResponse({ type: DigitalLibrary })
  @ApiBearerAuth()
  @Post()
  @Auth({ allowedRoles: ["ADMIN"] })
  @UsePipes(new ZodValidationBodyPipe(postDigitalLibrariesRequestSchema))
  public async createDigitalLibrary(
    @Body() dto: CreateDigitalLibraryDto
  ): Promise<DigitalLibrary> {
    return this.digitalLibraryAdminService.createDigitalLibrary(dto);
  }
}
