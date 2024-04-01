import { Module } from "@nestjs/common";

import { PrismaModule } from "@recnet-api/database/prisma/prisma.module";

import ArticleRepository from "./article.repository";
import InviteCodeRepository from "./invite-code.repository";
import RecRepository from "./rec.repository";
import UserRepository from "./user.repository";

@Module({
  imports: [PrismaModule],
  providers: [
    ArticleRepository,
    InviteCodeRepository,
    RecRepository,
    UserRepository,
  ],
  exports: [
    ArticleRepository,
    InviteCodeRepository,
    RecRepository,
    UserRepository,
  ],
})
export class DbRepositoryModule {}
