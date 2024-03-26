import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import * as CommonConfigs from "./config/common.config";
import { parseEnv } from "./config/env.schema";
import { ArticleModule } from "./modules/article/article.module";
import { HealthModule } from "./modules/health/health.module";
import { RecModule } from "./modules/rec/rec.module";
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
