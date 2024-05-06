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

  private transformInviteCodeFilterByToPrismaWhere(
    filter: InviteCodeFilterBy
  ): Prisma.InviteCodeWhereInput {
    const where: Prisma.InviteCodeWhereInput = {};
    if (filter.used === true) {
      where.usedAt = { not: null };
    } else if (filter.used === false) {
      where.usedAt = null;
    }
    return where;
  }
}
