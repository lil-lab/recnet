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
    
    const recs = await this.prisma.recommendation.findMany({
      where: this.transformRecFilterByToPrismaWhere(filter),
      select: rec.select,
    });

    const reactions = await this.prisma.recReaction.findMany({
      where: this.transformReactionFilterByToPrismaWhere(filter),
      select: reaction.select,
    });

    // Combine and transform results
    const activities: Activity[] = [
      ...recs.map((rec: Rec) => ({
        type: "rec" as const,
        timestamp: rec.cutoff,
        data: rec,
      })),
      ...reactions.map((reaction: Reaction) => ({
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
    // Create a raw SQL query that unions recommendations and reactions
    // const result = await this.prisma.$queryRaw<
    //   Array<(Rec | Reaction) & { type: "rec" | "reaction"; timestamp: Date }>
    // >`
    //   (
    //     SELECT 
    //       'rec'::text as type,
    //       r."cutoff" as timestamp,
    //       r."id"::varchar,
    //       r."description"::text,
    //       r."isSelfRec"::boolean,
    //       r."cutoff"::timestamp,
    //       r."userId"::varchar,
    //       r."articleId"::varchar,
    //       (
    //         SELECT json_agg(rr.*)
    //         FROM "RecReaction" rr
    //         WHERE rr."recId" = r."id"
    //       ) as reactions,
    //       NULL::text as "reaction",
    //       NULL::json as "recommendation"
    //     FROM "Recommendation" r
    //     WHERE ${this.buildRecWhereClause(filter)}
    //   )
    //   UNION ALL
    //   (
    //     SELECT 
    //       'reaction'::text as type,
    //       rr."createdAt" as timestamp,
    //       rr."id"::text,
    //       NULL::text as "description",
    //       NULL::boolean as "isSelfRec",
    //       NULL::timestamp as "cutoff",
    //       rr."userId"::varchar,
    //       NULL::varchar as "articleId",
    //       NULL::json as reactions,
    //       rr."reaction"::text,
    //       (
    //         SELECT row_to_json(rec.*)
    //         FROM "Recommendation" rec
    //         WHERE rec."id" = rr."recId"
    //       ) as recommendation
    //     FROM "RecReaction" rr
    //     WHERE ${this.buildReactionWhereClause(filter)}
    //   )
    //   ORDER BY timestamp DESC
    //   LIMIT ${pageSize}
    //   OFFSET ${offset}
    // `;

    // Transform the results into the expected Activity format
  //   return result.map((item) => ({
  //     type: item.type as "rec" | "reaction",
  //     timestamp: new Date(item.timestamp),
  //     data: item,
  //   }));
  // }

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
      // Calculate cutoff date for the previous cycle
      const prevCutoff = new Date(
        filter.cutoff.getTime() - 24 * 60 * 60 * 1000
      );
      // only get reactions created during this cycle for feeds
      where.createdAt = {
        gt: prevCutoff,
        lte: filter.cutoff,
      };
    } else if (filter.cutoff) {
      where.createdAt = {
        gt: filter.cutoff.from,
        lte: filter.cutoff.to,
      };
    }

    return where;
  }

  private buildRecWhereClause(filter: ActivityFilterBy): Prisma.Sql {
    const conditions: Prisma.Sql[] = [];

    if (filter.userId) {
      conditions.push(Prisma.sql`r."userId" = ${filter.userId}`);
    }
    if (filter.userIds) {
      conditions.push(Prisma.sql`r."userId" = ANY(${filter.userIds})`);
    }
    if (filter.cutoff instanceof Date) {
      conditions.push(Prisma.sql`r."cutoff" = ${filter.cutoff}`);
    } else if (filter.cutoff) {
      conditions.push(
        Prisma.sql`r."cutoff" > ${filter.cutoff.from} AND r."cutoff" <= ${filter.cutoff.to}`
      );
    }

    return conditions.length > 0
      ? Prisma.sql`${Prisma.join(conditions, " AND ")}`
      : Prisma.sql`TRUE`;
  }

  private buildReactionWhereClause(filter: ActivityFilterBy): Prisma.Sql {
    const conditions: Prisma.Sql[] = [];

    if (filter.userId) {
      conditions.push(Prisma.sql`rr."userId" = ${filter.userId}`);
    }
    if (filter.userIds) {
      conditions.push(Prisma.sql`rr."userId" = ANY(${filter.userIds})`);
    }
    if (filter.cutoff instanceof Date) {
      const prevCutoff = new Date(
        filter.cutoff.getTime() - 24 * 60 * 60 * 1000
      );
      conditions.push(
        Prisma.sql`rr."createdAt" > ${prevCutoff} AND rr."createdAt" <= ${filter.cutoff}`
      );
    } else if (filter.cutoff) {
      conditions.push(
        Prisma.sql`rr."createdAt" > ${filter.cutoff.from} AND rr."createdAt" <= ${filter.cutoff.to}`
      );
    }

    return conditions.length > 0
      ? Prisma.sql`${Prisma.join(conditions, " AND ")}`
      : Prisma.sql`TRUE`;
  }
}
