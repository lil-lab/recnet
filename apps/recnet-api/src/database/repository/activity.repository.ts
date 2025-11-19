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

import { rec, Rec } from "./rec.repository.type";

// Constants for query optimization
const QUERY_MULTIPLIER = 3; // Query pageSize * multiplier records to ensure pagination accuracy
const MAX_QUERY_LIMIT = 500; // Hard limit to prevent excessive memory usage

@Injectable()
export default class ActivityRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findActivities(
    page: number,
    pageSize: number,
    filter: ActivityFilterBy = {}
  ): Promise<Activity[]> {
    // Calculate query limit: fetch more records than needed to ensure pagination accuracy
    // after merging recs and reactions, but cap at MAX_QUERY_LIMIT to prevent excessive memory usage
    const queryLimit = Math.min(pageSize * QUERY_MULTIPLIER, MAX_QUERY_LIMIT);

    // Get recommendations with database-level sorting and limit
    const recs = await this.prisma.recommendation.findMany({
      where: this.transformRecFilterByToPrismaWhere(filter),
      select: rec.select,
      orderBy: { cutoff: Prisma.SortOrder.desc },
      take: queryLimit,
    });

    // Get reactions with database-level sorting and limit
    const reactions = await this.prisma.recReaction.findMany({
      where: this.transformReactionFilterByToPrismaWhere(filter),
      select: reaction.select,
      orderBy: { createdAt: Prisma.SortOrder.desc },
      take: queryLimit,
    });

    // Combine and transform results
    const activities: Activity[] = [
      ...recs.map((rec: Rec) => ({
        type: "REC" as const,
        timestamp: rec.cutoff,
        data: rec,
      })),
      ...reactions.map((reaction: Reaction) => ({
        type: "REACTION" as const,
        timestamp: reaction.createdAt,
        data: reaction,
      })),
    ];

    // Sort by timestamp in descending order (final merge sort)
    // Note: This is still needed because we're merging two sorted lists
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
    filter: ActivityFilterBy = {}
  ): Prisma.RecommendationWhereInput {
    const where: Prisma.RecommendationWhereInput = {};

    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.userIds && filter.userIds.length > 0) {
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
    if (filter.userIds && filter.userIds.length > 0) {
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
