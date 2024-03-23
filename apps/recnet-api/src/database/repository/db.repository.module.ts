import { Module } from "@nestjs/common";

import { PrismaModule } from "@recnet-api/database/prisma/prisma.module";

import RecRepository from "./rec.repository";
import UserRepository from "./user.repository";

@Module({
  imports: [PrismaModule],
  providers: [UserRepository, RecRepository],
  exports: [UserRepository, RecRepository],
})
export class DbRepositoryModule {}
