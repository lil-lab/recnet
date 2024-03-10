import { Module } from "@nestjs/common";

import { HealthModule } from "./modules/health/health.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [HealthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
