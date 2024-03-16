import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HealthModule } from "./modules/health/health.module";
import { UserModule } from "./modules/user/user.module";
import * as CommonConfigs from "./config/common.config";
import { parseEnv } from "./config/env.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => parseEnv(env),
      load: [...Object.values(CommonConfigs)],
    }),
    HealthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
