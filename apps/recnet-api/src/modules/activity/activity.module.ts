import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { ActivityController } from "./activity.controller";
import { ActivityService } from "./activity.service";

@Module({
  controllers: [ActivityController],
  providers: [ActivityService],
  imports: [DbRepositoryModule],
})
export class ActivityModule {}
