import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";
import { EmailModule } from "@recnet-api/modules/email/email.module";

import { SlackService } from "./slack.service";
import { SubscriptionController } from "./subscription.controller";
import { WeeklyDigestWorker } from "./weekly-digest.worker";

@Module({
  controllers: [SubscriptionController],
  providers: [SlackService, WeeklyDigestWorker],
  imports: [DbRepositoryModule, EmailModule],
})
export class SubscriptionModule {}
