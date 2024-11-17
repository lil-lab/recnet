import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";
import { EmailModule } from "@recnet-api/modules/email/email.module";

import { SubscriptionController } from "./subscription.controller";
import { WeeklyDigestWorker } from "./weekly-digest.worker";

import { SlackModule } from "../slack/slack.module";

@Module({
  controllers: [SubscriptionController],
  providers: [WeeklyDigestWorker],
  imports: [DbRepositoryModule, EmailModule, SlackModule],
})
export class SubscriptionModule {}
