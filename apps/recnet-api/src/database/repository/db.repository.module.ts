import { Module } from "@nestjs/common";

import { PrismaModule } from "@recnet-api/database/prisma/prisma.module";

import ActivityRepository from "./activity.repository";
import AnnouncementRepository from "./announcement.repository";
import ArticleRepository from "./article.repository";
import DigitalLibraryRepository from "./digital-library.repository";
import FollowingRecordRepository from "./followingRecord.repository";
import InviteCodeRepository from "./invite-code.repository";
import RecRepository from "./rec.repository";
import UserRepository from "./user.repository";
import WeeklyDigestCronLogRepository from "./weekly-digest-cron-log.repository";

@Module({
  imports: [PrismaModule],
  providers: [
    AnnouncementRepository,
    ArticleRepository,
    DigitalLibraryRepository,
    FollowingRecordRepository,
    InviteCodeRepository,
    RecRepository,
    ActivityRepository,
    UserRepository,
    WeeklyDigestCronLogRepository,
  ],
  exports: [
    AnnouncementRepository,
    ArticleRepository,
    DigitalLibraryRepository,
    FollowingRecordRepository,
    InviteCodeRepository,
    RecRepository,
    ActivityRepository,
    UserRepository,
    WeeklyDigestCronLogRepository,
  ],
})
export class DbRepositoryModule {}
