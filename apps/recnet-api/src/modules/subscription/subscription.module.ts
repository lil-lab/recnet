import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { SlackService } from "./slack.service";
import { SubscriptionController } from "./subscription.controller";

@Module({
  controllers: [SubscriptionController],
  providers: [SlackService],
  imports: [DbRepositoryModule],
})
export class SubscriptionModule {}
