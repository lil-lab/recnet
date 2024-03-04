import { Module } from "@nestjs/common";

import { UserController } from "./user.controller";
import { DbRepositoryModule } from "src/database/repository/db.repository.module";

@Module({
  controllers: [UserController],
  imports: [DbRepositoryModule],
})
export class UserModule {}
