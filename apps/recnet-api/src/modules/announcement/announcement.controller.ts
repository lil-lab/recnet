import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import {
  ZodValidationBodyPipe,
  ZodValidationQueryPipe,
} from "@recnet-api/utils/pipes/zod.validation.pipe";

import {
  getAnnouncementsParamsSchema,
  patchAnnouncementRequestSchema,
  postAnnouncementsRequestSchema,
} from "@recnet/recnet-api-model";

import { GetAnnouncementsResponse } from "./announcement.response";
import { AnnouncementService } from "./announcement.service";
import { CreateAnnouncementDto } from "./dto/create.announcement.dto";
import { QueryAnnouncementsDto } from "./dto/query.announcement.dto";
import { UpdateAnnouncementDto } from "./dto/update.announcement.dto";
import { Announcement } from "./entities/announcement.entity";

@ApiTags("announcements")
@Controller("announcements")
@UseFilters(RecnetExceptionFilter)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @ApiOperation({
    summary: "Get announcements",
    description:
      "Get announcements with pagination and filter. If no filter is provided, all announcements are returned.",
  })
  @ApiOkResponse({ type: GetAnnouncementsResponse })
  @Get()
  @UsePipes(new ZodValidationQueryPipe(getAnnouncementsParamsSchema))
  public async getAnnouncements(
    @Query() dto: QueryAnnouncementsDto
  ): Promise<GetAnnouncementsResponse> {
    const { page, pageSize, ...filter } = dto;
    return this.announcementService.getAnnouncements(page, pageSize, filter);
  }

  @ApiOperation({
    summary: "Create announcement",
    description: "Create announcement. Only ADMIN can create announcement.",
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: Announcement })
  @Post()
  @Auth({ allowedRoles: ["ADMIN"] })
  @UsePipes(new ZodValidationBodyPipe(postAnnouncementsRequestSchema))
  public async createAnnouncement(
    @Body() dto: CreateAnnouncementDto,
    @User() authUser: AuthUser
  ): Promise<Announcement> {
    const { userId } = authUser;
    return this.announcementService.createAnnouncement(dto, userId);
  }

  @ApiOperation({
    summary: "Update announcement",
    description:
      "Update announcement by id. Only ADMIN can update announcement.",
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: Announcement })
  @Patch("/:id")
  @Auth({ allowedRoles: ["ADMIN"] })
  @UsePipes(new ZodValidationBodyPipe(patchAnnouncementRequestSchema))
  public async updateAnnouncement(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto
  ): Promise<Announcement> {
    return this.announcementService.updateAnnouncement(id, dto);
  }
}
