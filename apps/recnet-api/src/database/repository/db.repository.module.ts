import { Module } from "@nestjs/common";

import { PrismaModule } from "@recnet-api/database/prisma/prisma.module";

import ArticleRepository from "./article.repository";
import FollowingRecordRepository from "./followingRecord.repository";
import InviteCodeRepository from "./invite-code.repository";
import RecRepository from "./rec.repository";
import UserRepository from "./user.repository";
import WeeklyDigestCronLogRepository from "./weekly-digest-cron-log.repository";

@Module({
  imports: [PrismaModule],
  providers: [
    ArticleRepository,
    FollowingRecordRepository,
    InviteCodeRepository,
    RecRepository,
    UserRepository,
    WeeklyDigestCronLogRepository,
  ],
  exports: [
    ArticleRepository,
    FollowingRecordRepository,
    InviteCodeRepository,
    RecRepository,
    UserRepository,
    WeeklyDigestCronLogRepository,
  ],
})
export class DbRepositoryModule {}
