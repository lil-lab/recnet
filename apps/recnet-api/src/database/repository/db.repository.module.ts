import { Module } from "@nestjs/common";

import { PrismaModule } from "@recnet-api/database/prisma/prisma.module";

import UserRepository from "./user.repository";

@Module({
  imports: [PrismaModule],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class DbRepositoryModule {}
