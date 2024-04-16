import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, Transporter } from "nodemailer";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { MAIL_TRANSPORTER } from "./email.const";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";

const transporterFactory = (configService: ConfigService): Transporter => {
  const nodemailerConfig = configService.get("nodemailer");

  const { service, host, port, secure, user, pass } = nodemailerConfig;
  return createTransport({
    service,
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

@Module({
  controllers: [EmailController],
  providers: [
    EmailService,
    {
      provide: MAIL_TRANSPORTER,
      useFactory: transporterFactory,
      inject: [ConfigService],
    },
  ],
  imports: [DbRepositoryModule],
})
export class EmailModule {}
