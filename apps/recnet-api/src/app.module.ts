import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import * as CommonConfigs from "./config/common.config";
import { parseEnv } from "./config/env.schema";
import { ArticleModule } from "./modules/article/article.module";
import { EmailModule } from "./modules/email/email.module";
import { HealthModule } from "./modules/health/health.module";
import { InviteCodeModule } from "./modules/invite-code/invite-code.module";
import { RecModule } from "./modules/rec/rec.module";
import { StatModule } from "./modules/stat/stat.module";
import { UserModule } from "./modules/user/user.module";
import { LoggerMiddleware } from "./utils/middlewares/logger.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => parseEnv(env),
      load: [...Object.values(CommonConfigs)],
    }),
    HealthModule,
    UserModule,
    RecModule,
    ArticleModule,
    InviteCodeModule,
    StatModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
