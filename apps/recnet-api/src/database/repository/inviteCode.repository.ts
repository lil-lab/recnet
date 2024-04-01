import { Injectable } from "@nestjs/common";
import { InviteCode } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";

@Injectable()
export default class InviteCodeRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findInviteCode(code: string): Promise<InviteCode | null> {
    return this.prisma.inviteCode.findFirst({
      where: { code },
    });
  }
}
