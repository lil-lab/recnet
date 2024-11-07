import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { SlackService } from "./slack.service";
import { SlackTransporter } from "./transporters/slack.transporter";

@Module({
  providers: [SlackService, SlackTransporter],
  imports: [DbRepositoryModule],
  exports: [SlackService],
})
export class SlackModule {}
