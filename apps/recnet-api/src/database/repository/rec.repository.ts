import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { rec, Rec } from "@recnet-api/database/repository/rec.repository.type";
import { getOffset } from "@recnet-api/utils";

@Injectable()
export default class RecRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findRecs(
    page: number,
    pageSize: number,
    userId: string
  ): Promise<Rec[]> {
    return this.prisma.recommendation.findMany({
      select: rec.select,
      where: {
        userId: userId,
      },
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: { id: Prisma.SortOrder.asc },
    });
  }

  public async countRecs(userId: string): Promise<number> {
    return this.prisma.recommendation.count({
      where: {
        userId: userId,
      },
    });
  }
}
