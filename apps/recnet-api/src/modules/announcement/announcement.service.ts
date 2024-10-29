import { HttpStatus, Inject, Injectable } from "@nestjs/common";

import AnnouncementRepository from "@recnet-api/database/repository/announcement.repository";
import { AnnouncementFilterBy } from "@recnet-api/database/repository/announcement.repository.type";
import { getOffset } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { GetAnnouncementsResponse } from "./announcement.response";
import { transformAnnouncement } from "./announcement.transform";
import { CreateAnnouncementDto } from "./dto/create.announcement.dto";
import { UpdateAnnouncementDto } from "./dto/update.announcement.dto";
import { Announcement } from "./entities/announcement.entity";

@Injectable()
export class AnnouncementService {
  constructor(
    @Inject(AnnouncementRepository)
    private readonly announcementRepository: AnnouncementRepository
  ) {}

  public async getAnnouncements(
    page: number,
    pageSize: number,
    filter: AnnouncementFilterBy
  ): Promise<GetAnnouncementsResponse> {
    const totalCount: number =
      await this.announcementRepository.countAnnouncements(filter);
    const dbAnnouncements = await this.announcementRepository.findAnnouncements(
      page,
      pageSize,
      filter
    );

    return {
      hasNext: dbAnnouncements.length + getOffset(page, pageSize) < totalCount,
      totalCount,
      announcements: dbAnnouncements.map(transformAnnouncement),
    };
  }

  public async createAnnouncement(
    dto: CreateAnnouncementDto,
    userId: string
  ): Promise<Announcement> {
    const createAnnouncementInput = {
      title: dto.title,
      content: dto.content,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      isActivated: dto.isActivated,
      allowClose: dto.allowClose,
      createdById: userId,
    };
    const dbAnnouncement = await this.announcementRepository.createAnnouncement(
      createAnnouncementInput
    );
    return transformAnnouncement(dbAnnouncement);
  }

  public async updateAnnouncement(
    id: number,
    dto: UpdateAnnouncementDto
  ): Promise<Announcement> {
    const startAt = dto.startAt ? new Date(dto.startAt) : undefined;
    const endAt = dto.endAt ? new Date(dto.endAt) : undefined;

    // validate startAt and endAt
    if (startAt || endAt) {
      const currentAnnouncement =
        await this.announcementRepository.findAnnouncementById(id);

      if (
        (startAt && endAt && startAt > endAt) ||
        (startAt && startAt > currentAnnouncement.endAt) ||
        (endAt && endAt < currentAnnouncement.startAt)
      ) {
        throw new RecnetError(
          ErrorCode.START_DATE_AFTER_END_DATE,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const updateAnnouncementInput = {
      title: dto.title,
      content: dto.content,
      startAt,
      endAt,
      isActivated: dto.isActivated,
      allowClose: dto.allowClose,
    };
    const updatedDbAnnouncement =
      await this.announcementRepository.updateAnnouncement(
        id,
        updateAnnouncementInput
      );
    return transformAnnouncement(updatedDbAnnouncement);
  }
}
