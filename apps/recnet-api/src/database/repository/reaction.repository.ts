import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import {
  reaction,
  Reaction,
  ReactionFilterBy,
} from "@recnet-api/database/repository/reaction.repository.type";
import { getOffset } from "@recnet-api/utils";

@Injectable()
export default class ReactionRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findReactions(
    page: number,
    pageSize: number,
    filter: ReactionFilterBy = {}
  ): Promise<Reaction[]> {
    return this.prisma.recReaction.findMany({
      select: reaction.select,
      where: this.transformReactionFilterByToPrismaWhere(filter),
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: [
        { createdAt: Prisma.SortOrder.desc },
        { recId: Prisma.SortOrder.desc },
      ],
    });
  }

  public async countReactions(filter: ReactionFilterBy = {}): Promise<number> {
    return this.prisma.recReaction.count({
      where: this.transformReactionFilterByToPrismaWhere(filter),
    });
  }

  private transformReactionFilterByToPrismaWhere(
    filter: ReactionFilterBy
  ): Prisma.RecReactionWhereInput {
    const where: Prisma.RecReactionWhereInput = {};
    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.userIds) {
      where.userId = { in: filter.userIds };
    }

    if (filter.cutoff instanceof Date) {
      where.createdAt = { lte: filter.cutoff }; // Fetch reactions created before cutoff date
    } else if (filter.cutoff) {
      where.createdAt = {
        gte: filter.cutoff.from,
        lte: filter.cutoff.to,
      };
    }

    return where;
  }
}
