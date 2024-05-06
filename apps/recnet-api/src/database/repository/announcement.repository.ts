import { Injectable } from "@nestjs/common";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";

import {
  Announcement,
  CreateAnnouncementInput,
  announcement,
} from "./announcement.repository.type";

@Injectable()
export default class AnnouncementRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async createAnnouncement(
    createAnnouncementInput: CreateAnnouncementInput
  ): Promise<Announcement> {
    const { createdById, ...rest } = createAnnouncementInput;
    return this.prisma.announcement.create({
      data: {
        ...rest,
        createdBy: {
          connect: {
            id: createdById,
          },
        },
      },
      select: announcement.select,
    });
  }
}
