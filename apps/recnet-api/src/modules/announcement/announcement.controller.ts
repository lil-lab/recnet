import { Body, Controller, Post, UseFilters, UsePipes } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { AuthUser } from "@recnet-api/utils/auth/auth.type";
import { User } from "@recnet-api/utils/auth/auth.user.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { postAnnouncementsRequestSchema } from "@recnet/recnet-api-model";

import { AnnouncementService } from "./announcement.service";
import { CreateAnnouncementDto } from "./dto/create.announcement.dto";
import { Announcement } from "./entities/announcement.entity";

@ApiTags("announcements")
@Controller("announcements")
@UseFilters(RecnetExceptionFilter)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @Auth(["ADMIN"])
  @UsePipes(new ZodValidationPipe(postAnnouncementsRequestSchema))
  public async createAnnouncement(
    @Body() dto: CreateAnnouncementDto,
    @User() authUser: AuthUser
  ): Promise<Announcement> {
    const { userId } = authUser;
    return this.announcementService.createAnnouncement(dto, userId);
  }
}
