import { Inject, Injectable } from "@nestjs/common";

import AnnouncementRepository from "@recnet-api/database/repository/announcement.repository";
import { Announcement as DbAnnouncement } from "@recnet-api/database/repository/announcement.repository.type";

import { CreateAnnouncementDto } from "./dto/create.announcement.dto";
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
