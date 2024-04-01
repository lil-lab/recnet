import { Injectable } from "@nestjs/common";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";

@Injectable()
export default class InviteCodeRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async createInviteCode(
    codes: string[],
    ownerId: string
  ): Promise<void> {
    await this.prisma.inviteCode.createMany({
      data: codes.map((code) => ({
        code,
        ownerId,
        issuedAt: new Date(),
      })),
    });
  }
}
