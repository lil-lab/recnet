import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import * as CommonConfigs from "./config/common.config";
import { parseEnv } from "./config/env.schema";
import { ActivitiesModule } from "./modules/activities/activities.module";
import { AnnouncementModule } from "./modules/announcement/announcement.module";
import { ArticleModule } from "./modules/article/article.module";
import { EmailModule } from "./modules/email/email.module";
import { HealthModule } from "./modules/health/health.module";
import { InviteCodeModule } from "./modules/invite-code/invite-code.module";
import { PhotoStorageModule } from "./modules/photo-storage/photo-storage.module";
import { RecModule } from "./modules/rec/rec.module";
import { StatModule } from "./modules/stat/stat.module";
import { SubscriptionModule } from "./modules/subscription/subscription.module";
import { UserModule } from "./modules/user/user.module";
import { LoggerMiddleware } from "./utils/middlewares/logger.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => parseEnv(env),
      load: [...Object.values(CommonConfigs)],
    }),
    ScheduleModule.forRoot(),
    HealthModule,
    UserModule,
    RecModule,
    ArticleModule,
    InviteCodeModule,
    StatModule,
    EmailModule,
    AnnouncementModule,
    SubscriptionModule,
    PhotoStorageModule,
    ActivitiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
