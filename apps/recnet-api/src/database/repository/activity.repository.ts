import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import {
  Activity,
  ActivityFilterBy,
  reaction,
  Reaction,
} from "@recnet-api/database/repository/activity.repository.type";
import { getOffset } from "@recnet-api/utils";

import { rec, Rec, RecFilterBy } from "./rec.repository.type";

@Injectable()
export default class ActivityRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findActivities(
    page: number,
    pageSize: number,
    filter: ActivityFilterBy
  ): Promise<Activity[]> {
    // Get recommendations
    const recs = await this.prisma.recommendation.findMany({
      where: this.transformRecFilterByToPrismaWhere(filter),
      select: rec.select,
    });
    // consider setting an upper bound for the number of records to get.
    // e.g: currently on page 5, page_size: 10, consider max return size of 4 pages: 40 records.
    // Get reactions
    const reactions = await this.prisma.recReaction.findMany({
      where: this.transformReactionFilterByToPrismaWhere(filter),
      select: reaction.select,
    });

    // Combine and transform results
    const activities: Activity[] = [
      ...recs.map((rec) => ({
        type: "rec" as const,
        timestamp: rec.cutoff,
        data: rec,
      })),
      ...reactions.map((reaction) => ({
        type: "reaction" as const,
        timestamp: reaction.createdAt,
        data: reaction,
      })),
    ];

    // Sort by timestamp in descending order
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = getOffset(page, pageSize);
    return activities.slice(offset, offset + pageSize);
  }

  public async countActivities(filter: ActivityFilterBy = {}): Promise<number> {
    const recCount = await this.prisma.recommendation.count({
      where: this.transformRecFilterByToPrismaWhere(filter),
    });
    const reactionCount = await this.prisma.recReaction.count({
      where: this.transformReactionFilterByToPrismaWhere(filter),
    });
    const activitiesCount = recCount + reactionCount;
    return activitiesCount;
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

    if (filter.cutoff instanceof Date) {
      where.cutoff = filter.cutoff;
    } else if (filter.cutoff) {
      where.cutoff = {
        gt: filter.cutoff.from,
        lte: filter.cutoff.to,
      };
    }

    return where;
  }

  private transformReactionFilterByToPrismaWhere(
    filter: ActivityFilterBy
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
