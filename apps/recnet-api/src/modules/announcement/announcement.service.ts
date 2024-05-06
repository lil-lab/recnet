import { HttpStatus, Inject, Injectable } from "@nestjs/common";

import AnnouncementRepository from "@recnet-api/database/repository/announcement.repository";
import { Announcement as DbAnnouncement } from "@recnet-api/database/repository/announcement.repository.type";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { CreateAnnouncementDto } from "./dto/create.announcement.dto";
import { UpdateAnnouncementDto } from "./dto/update.announcement.dto";
import { Announcement } from "./entities/announcement.entity";

@Injectable()
export class AnnouncementService {
  constructor(
    @Inject(AnnouncementRepository)
    private readonly announcementRepository: AnnouncementRepository
  ) {}

  public async createAnnouncement(
    dto: CreateAnnouncementDto,
    userId: string
  ): Promise<Announcement> {
    const createAnnouncementInput = {
      ...dto,
      createdById: userId,
    };
    const dbAnnouncement = await this.announcementRepository.createAnnouncement(
      createAnnouncementInput
    );
    return this.transformAnnouncement(dbAnnouncement);
  }

  public async updateAnnouncement(
    id: number,
    dto: UpdateAnnouncementDto
  ): Promise<Announcement> {
    // validate startAt and endAt
    if (dto.startAt || dto.endAt) {
      const currentAnnouncement =
        await this.announcementRepository.findAnnouncementById(id);

      if (
        (dto.startAt && dto.endAt && dto.startAt > dto.endAt) ||
        (dto.startAt && dto.startAt > currentAnnouncement.endAt) ||
        (dto.endAt && dto.endAt < currentAnnouncement.startAt)
      ) {
        throw new RecnetError(
          ErrorCode.START_DATE_AFTER_END_DATE,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const updatedDbAnnouncement =
      await this.announcementRepository.updateAnnouncement(id, dto);
    return this.transformAnnouncement(updatedDbAnnouncement);
  }

  private transformAnnouncement(dbAnnouncement: DbAnnouncement): Announcement {
    const { createdBy } = dbAnnouncement;
    const createdByUserPreview = {
      id: createdBy.id,
      handle: createdBy.handle,
      displayName: createdBy.displayName,
      photoUrl: createdBy.photoUrl,
      affiliation: createdBy.affiliation,
      bio: createdBy.bio,
      numFollowers: createdBy.followedBy.length,
    };
    return {
      id: dbAnnouncement.id,
      title: dbAnnouncement.title,
      content: dbAnnouncement.content,
      startAt: dbAnnouncement.startAt,
      endAt: dbAnnouncement.endAt,
      isActivated: dbAnnouncement.isActivated,
      allowClose: dbAnnouncement.allowClose,
      createdBy: createdByUserPreview,
    };
  }
}
