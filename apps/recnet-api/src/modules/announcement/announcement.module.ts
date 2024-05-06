import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { AnnouncementController } from "./announcement.controller";
import { AnnouncementService } from "./announcement.service";

@Module({
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
  imports: [DbRepositoryModule],
})
export class AnnouncementModule {}
