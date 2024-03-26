import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { UserFilterBy } from "@recnet-api/modules/user/user.type";
import { getOffset } from "@recnet-api/utils";

import { User, UserPreview, user, userPreview } from "./user.repository.type";

@Injectable()
export default class UserRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findUsers(
    page: number,
    pageSize: number,
    filter: UserFilterBy = {}
  ): Promise<UserPreview[]> {
    const where: Prisma.UserWhereInput =
      this.transformUserFilterByToPrismaWhere(filter);
    return this.prisma.user.findMany({
      select: userPreview.select,
      where,
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: { id: Prisma.SortOrder.asc },
    });
  }

  public async countUsers(filter: UserFilterBy = {}): Promise<number> {
    const where: Prisma.UserWhereInput =
      this.transformUserFilterByToPrismaWhere(filter);
    return this.prisma.user.count({ where });
  }

  public async findUserById(userId: string): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: user.select,
    });
  }

  public async findUserPreviewByIds(userIds: string[]): Promise<UserPreview[]> {
    return this.prisma.user.findMany({
      select: userPreview.select,
      where: { id: { in: userIds } },
    });
  }

  private transformUserFilterByToPrismaWhere(
    filter: UserFilterBy
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};
    if (filter.handle) {
      where.handle = filter.handle;
    }
    if (filter.id) {
      where.id = filter.id;
    }

    if (filter.keyword) {
      const searchStr = filter.keyword.split(" ").join(" | ");
      where.OR = [
        { handle: { search: searchStr } },
        { displayName: { search: searchStr } },
      ];
    }
    return where;
  }
}
