import { Module } from "@nestjs/common";

import { PrismaModule } from "@recnet-api/database/prisma/prisma.module";

import ArticleRepository from "./article.repository";
import RecRepository from "./rec.repository";
import UserRepository from "./user.repository";

@Module({
  imports: [PrismaModule],
  providers: [UserRepository, RecRepository, ArticleRepository],
  exports: [UserRepository, RecRepository, ArticleRepository],
})
export class DbRepositoryModule {}
