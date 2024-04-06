import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { RecController } from "./rec.controller";
import { RecService } from "./rec.service";

@Module({
  controllers: [RecController],
  providers: [RecService],
  imports: [DbRepositoryModule],
})
export class RecModule {}
