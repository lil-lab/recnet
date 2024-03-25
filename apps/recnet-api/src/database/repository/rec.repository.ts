import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { rec, Rec } from "@recnet-api/database/repository/rec.repository.type";
import { getOffset } from "@recnet-api/utils";

import { getNextCutOff } from "@recnet/recnet-date-fns";

@Injectable()
export default class RecRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findRecs(
    page: number,
    pageSize: number,
    where: Prisma.RecommendationWhereInput
  ): Promise<Rec[]> {
    return this.prisma.recommendation.findMany({
      select: rec.select,
      where: where,
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: { id: Prisma.SortOrder.asc },
    });
  }

  public async countRecs(
    where: Prisma.RecommendationWhereInput
  ): Promise<number> {
    return this.prisma.recommendation.count({
      where: where,
    });
  }

  public async findUpcomingRec(userId: string): Promise<Rec | null> {
    const recommendataion = await this.prisma.recommendation.findFirst({
      where: {
        userId: userId,
      },
      select: rec.select,
      orderBy: { cutoff: Prisma.SortOrder.desc },
    });
    if (!recommendataion) {
      return null;
    }
    if (recommendataion.cutoff.getTime() !== getNextCutOff().getTime()) {
      return null;
    }
    return recommendataion;
  }

  public async createRec(data: Prisma.RecommendationCreateInput): Promise<Rec> {
    return this.prisma.recommendation.create({
      data: data,
      select: rec.select,
    });
  }

  public async deleteUpcomingRec(recId: string): Promise<void> {
    await this.prisma.recommendation.delete({
      where: {
        id: recId,
      },
    });
  }
}
