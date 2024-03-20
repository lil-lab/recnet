import { Module } from "@nestjs/common";
import { DbRepositoryModule } from "src/database/repository/db.repository.module";

import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  imports: [DbRepositoryModule],
})
export class UserModule {}
