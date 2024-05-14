import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { getOffset } from "@recnet-api/utils";

import {
  Announcement,
  AnnouncementFilterBy,
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

  public async countAnnouncements(
    filter: AnnouncementFilterBy
  ): Promise<number> {
    const where: Prisma.AnnouncementWhereInput =
      this.transformFilterToPrismaWhere(filter);
    return this.prisma.announcement.count({ where });
  }

  public async findAnnouncements(
    page: number,
    pageSize: number,
    filter: AnnouncementFilterBy
  ): Promise<Announcement[]> {
    const where: Prisma.AnnouncementWhereInput =
      this.transformFilterToPrismaWhere(filter);
    return this.prisma.announcement.findMany({
      select: announcement.select,
      where,
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: [
        { startAt: Prisma.SortOrder.desc },
        { createdAt: Prisma.SortOrder.desc },
      ],
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

  private transformFilterToPrismaWhere(
    filter: AnnouncementFilterBy
  ): Prisma.AnnouncementWhereInput {
    const where: Prisma.AnnouncementWhereInput = {};

    if (filter.activatedOnly) {
      where.isActivated = true;
    }

    if (filter.currentOnly) {
      where.startAt = {
        lte: new Date(),
      };
      where.endAt = {
        gte: new Date(),
      };
    }

    return where;
  }
}
