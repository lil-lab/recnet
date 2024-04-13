import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [DbRepositoryModule],
})
export class EmailModule {}
