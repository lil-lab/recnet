import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { EmailService } from "./email.service";
import EmailTransporter from "./transporters/email.transporter";

@Module({
  providers: [EmailService, EmailTransporter],
  imports: [DbRepositoryModule],
  exports: [EmailService],
})
export class EmailModule {}
