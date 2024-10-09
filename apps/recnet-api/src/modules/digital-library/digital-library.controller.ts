import {
  Controller,
  UseFilters,
  Get,
  UsePipes,
  Query,
  Body,
  Post,
  Patch,
  ParseIntPipe,
  Param,
  Delete,
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
  patchDigitalLibrariesRequestSchema,
  postDigitalLibrariesRankRequestSchema,
  postDigitalLibrariesRequestSchema,
} from "@recnet/recnet-api-model";

import { DigitalLibraryAdminService } from "./digital-library.admin.service";
import { GetDigitalLibrariesResponse } from "./digital-library.response";
import { CreateDigitalLibraryDto } from "./dto/create.digital-library.dto";
import { QueryDigitalLibraryDto } from "./dto/query.digital-library.dto";
import {
  UpdateDigitalLibrariesRankDto,
  UpdateDigitalLibraryDto,
} from "./dto/update.digital-library.dto";
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

  @ApiOperation({
    summary: "Update Digital Library",
    description: "Update digital library by id.",
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: DigitalLibrary })
  @Patch("/:id")
  @Auth({ allowedRoles: ["ADMIN"] })
  @UsePipes(new ZodValidationBodyPipe(patchDigitalLibrariesRequestSchema))
  public async updateDigitalLibrary(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDigitalLibraryDto
  ): Promise<DigitalLibrary> {
    return this.digitalLibraryAdminService.updateDigitalLibrary(id, dto);
  }

  @ApiOperation({
    summary: "Delete Digital Library",
    description: "Delete digital library by id.",
  })
  @ApiBearerAuth()
  @Delete("/:id")
  @Auth({ allowedRoles: ["ADMIN"] })
  public async deleteDigitalLibrary(
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    return this.digitalLibraryAdminService.deleteDigitalLibrary(id);
  }

  @ApiOperation({
    summary: "Update Digital Libraries Rank",
    description: "Update digital libraries rank.",
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: GetDigitalLibrariesResponse })
  @Post("/rank")
  @Auth({ allowedRoles: ["ADMIN"] })
  @UsePipes(new ZodValidationBodyPipe(postDigitalLibrariesRankRequestSchema))
  public async updateDigitalLibrariesRank(
    @Body() dto: UpdateDigitalLibrariesRankDto
  ): Promise<GetDigitalLibrariesResponse> {
    return this.digitalLibraryAdminService.updateDigitalLibrariesRank(dto);
  }
}
