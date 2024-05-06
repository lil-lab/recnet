import { Injectable } from "@nestjs/common";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";

import {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  announcement,
} from "./announcement.repository.type";

@Injectable()
export default class AnnouncementRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findAnnouncementById(id: number): Promise<Announcement> {
    return this.prisma.announcement.findUniqueOrThrow({
      where: { id },
      select: announcement.select,
    });
  }

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

  public async updateAnnouncement(
    id: number,
    updateAnnouncementInput: UpdateAnnouncementInput
  ): Promise<Announcement> {
    return this.prisma.announcement.update({
      where: { id },
      data: updateAnnouncementInput,
      select: announcement.select,
    });
  }
}
