import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HealthModule } from "./modules/health/health.module";
import { UserModule } from "./modules/user/user.module";
import * as CommonConfigs from "./config/common.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [...Object.values(CommonConfigs)],
    }),
    HealthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
