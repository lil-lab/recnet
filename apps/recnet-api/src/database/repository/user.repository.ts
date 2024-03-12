import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";

import PrismaConnectionProvider from "src/database/prisma/prisma.connection.provider";

@Injectable()
export default class UserRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findByHandle(handle: string): Promise<User> {
    return this.prisma.user.findFirst({
      where: { handle },
    });
  }
}
