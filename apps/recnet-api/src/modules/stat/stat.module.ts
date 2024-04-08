import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { StatController } from "./stat.controller";
import { StatService } from "./stat.service";

@Module({
  controllers: [StatController],
  providers: [StatService],
  imports: [DbRepositoryModule],
})
export class StatModule {}
