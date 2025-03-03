import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { ActivitiesController } from "./activities.controller";
import { ActivitiesService } from "./activities.service";

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  imports: [DbRepositoryModule],
})
export class ActivitiesModule {}
