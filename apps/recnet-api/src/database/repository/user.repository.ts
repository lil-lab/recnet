import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { UserFilterBy } from "@recnet-api/modules/user/user.type";
import { getOffset } from "@recnet-api/utils";

import { UserPreview } from "./user.repository.type";

@Injectable()
export default class UserRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findUsers(
    page: number,
    pageSize: number,
    filter: UserFilterBy = {}
  ): Promise<UserPreview[]> {
    const where: Prisma.UserWhereInput = { ...filter };
    return this.prisma.user.findMany({
      select: {
        id: true,
        handle: true,
        displayName: true,
        photoUrl: true,
        affiliation: true,
        bio: true,
        followedBy: true,
      },
      where,
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: { id: Prisma.SortOrder.asc },
    });
  }

  public async countUsers(filter: UserFilterBy = {}): Promise<number> {
    const where: Prisma.UserWhereInput = { ...filter };
    return this.prisma.user.count({ where });
  }
}
