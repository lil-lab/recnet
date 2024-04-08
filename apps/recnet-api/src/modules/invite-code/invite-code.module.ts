import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { InviteCodeController } from "./invite-code.controller";
import { InviteCodeService } from "./invite-code.service";

@Module({
  controllers: [InviteCodeController],
  providers: [InviteCodeService],
  imports: [DbRepositoryModule],
})
export class InviteCodeModule {}
