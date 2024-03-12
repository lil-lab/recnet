import { Module } from "@nestjs/common";

import PrismaConnectionProvider from "./prisma.connection.provider";

@Module({
  providers: [PrismaConnectionProvider],
  exports: [PrismaConnectionProvider],
})
export class PrismaModule {}
