import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { MAIL_TRANSPORTER } from "./email.const";
import { EmailService } from "./email.service";
import { Transporter } from "./email.type";
import EmailDevTransporter from "./transporters/email.dev.transporters";
import EmailTransporter from "./transporters/email.transporters";

const transporterFactory = (configService: ConfigService): Transporter => {
  const nodeEnv = configService.get("app").nodeEnv;
  const nodemailerConfig = configService.get("nodemailer");

  return nodeEnv === "production"
    ? new EmailTransporter(nodemailerConfig)
    : new EmailDevTransporter(nodemailerConfig);
};

@Module({
  providers: [
    EmailService,
    {
      provide: MAIL_TRANSPORTER,
      useFactory: transporterFactory,
      inject: [ConfigService],
    },
  ],
  imports: [DbRepositoryModule],
  exports: [EmailService],
})
export class EmailModule {}
