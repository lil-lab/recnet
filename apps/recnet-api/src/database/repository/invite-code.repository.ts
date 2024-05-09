import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { getOffset } from "@recnet-api/utils";

import {
  InviteCode,
  inviteCode,
  InviteCodeFilterBy,
} from "./invite-code.repository.type";

@Injectable()
export default class InviteCodeRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findInviteCode(code: string): Promise<InviteCode | null> {
    return this.prisma.inviteCode.findFirst({
      where: { code },
      select: inviteCode.select,
    });
  }

  public async createInviteCode(
    codeOwnerPairs: Array<{ code: string; ownerId: string }>
  ): Promise<void> {
    await this.prisma.inviteCode.createMany({
      data: codeOwnerPairs.map(({ code, ownerId }) => ({
        code,
        ownerId,
        issuedAt: new Date(),
      })),
    });
  }

  public async findInviteCodes(
    page: number,
    pageSize: number,
    filter: InviteCodeFilterBy
  ): Promise<InviteCode[]> {
    return this.prisma.inviteCode.findMany({
      select: inviteCode.select,
      where: this.transformInviteCodeFilterByToPrismaWhere(filter),
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: { usedAt: Prisma.SortOrder.desc },
    });
  }

  public async countInviteCodes(filter: InviteCodeFilterBy): Promise<number> {
    return this.prisma.inviteCode.count({
      where: this.transformInviteCodeFilterByToPrismaWhere(filter),
    });
  }

  public async countInviteCodesByOwnerIds(
    ownerIds: string[]
  ): Promise<{ userId: string; count: number }[]> {
    const counts = await this.prisma.inviteCode.groupBy({
      by: ["ownerId"],
      where: { ownerId: { in: ownerIds } },
      _count: { ownerId: true },
    });
    const countsRecord: Record<string, number> = {};
    counts.forEach((entry) => {
      countsRecord[entry.ownerId] = entry._count.ownerId;
    });
    return ownerIds.map((ownerId) => {
      return {
        userId: ownerId,
        count: countsRecord?.[ownerId] || 0,
      };
    });
  }

  private transformInviteCodeFilterByToPrismaWhere(
    filter: InviteCodeFilterBy
  ): Prisma.InviteCodeWhereInput {
    const where: Prisma.InviteCodeWhereInput = {};
    if (filter.used === true) {
      where.usedAt = { not: null };
    } else if (filter.used === false) {
      where.usedAt = null;
    }
    if (filter.ownerId) {
      where.ownerId = filter.ownerId;
    }
    return where;
  }
}
