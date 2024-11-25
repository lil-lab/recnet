import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";
import { SlackModule } from "@recnet-api/modules/slack/slack.module";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [DbRepositoryModule, SlackModule],
})
export class UserModule {}
