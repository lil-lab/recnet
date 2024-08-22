import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { rec, Rec } from "@recnet-api/database/repository/rec.repository.type";
import { RecFilterBy } from "@recnet-api/database/repository/rec.repository.type";
import { getOffset } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { getNextCutOff } from "@recnet/recnet-date-fns";

@Injectable()
export default class RecRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findRecs(
    page: number,
    pageSize: number,
    filter: RecFilterBy = {}
  ): Promise<Rec[]> {
    return this.prisma.recommendation.findMany({
      select: rec.select,
      where: this.transformRecFilterByToPrismaWhere(filter),
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: { cutoff: Prisma.SortOrder.desc },
    });
  }

  public async countRecs(filter: RecFilterBy = {}): Promise<number> {
    return this.prisma.recommendation.count({
      where: this.transformRecFilterByToPrismaWhere(filter),
    });
  }

  public async findUpcomingRec(userId: string): Promise<Rec | null> {
    const recommendation = await this.prisma.recommendation.findFirst({
      where: {
        userId: userId,
      },
      select: rec.select,
      orderBy: { cutoff: Prisma.SortOrder.desc },
    });
    if (!recommendation) {
      return null;
    }
    if (recommendation.cutoff.getTime() !== getNextCutOff().getTime()) {
      return null;
    }
    return recommendation;
  }

  public async createRec(
    userId: string,
    description: string,
    articleId: string
  ): Promise<Rec> {
    return this.prisma.recommendation.create({
      data: {
        description: description,
        cutoff: getNextCutOff(),
        user: {
          connect: {
            id: userId,
          },
        },
        article: {
          connect: {
            id: articleId,
          },
        },
      },
      select: rec.select,
    });
  }

  public async updateRec(
    id: string,
    description: string,
    articleId?: string
  ): Promise<Rec> {
    const data: Prisma.RecommendationUpdateInput = {
      description: description,
    };
    if (articleId) {
      data.article = {
        connect: {
          id: articleId,
        },
      };
    }
    return this.prisma.recommendation.update({
      where: {
        id: id,
      },
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

  public async getRecCountPerCutoff() {
    const recCounts = await this.prisma.recommendation.groupBy({
      by: ["cutoff"],
      _count: {
        _all: true,
      },
    });
    return recCounts.map((entry) => ({
      cutoff: entry.cutoff,
      count: entry._count._all,
    }));
  }

  private transformRecFilterByToPrismaWhere(
    filter: RecFilterBy
  ): Prisma.RecommendationWhereInput {
    const where: Prisma.RecommendationWhereInput = {};
    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.userIds) {
      where.userId = { in: filter.userIds };
    }

    if (filter.cutoff && filter.excludeCutoff) {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Both cutoff and excludeCutoff cannot be used together."
      );
    } else if (filter.cutoff) {
      where.cutoff = filter.cutoff;
    } else if (filter.excludeCutoff) {
      where.cutoff = { not: filter.excludeCutoff };
    }

    return where;
  }
}
