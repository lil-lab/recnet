import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { createTransport, Transporter, SendMailOptions } from "nodemailer";

import { AppConfig, NodemailerConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { SendResult } from "@recnet-api/modules/subscription/subscription.type";
import { sleep } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import {
  EMAIL_RETRY_LIMIT,
  EMAIL_RETRY_DURATION_MS,
  EMAIL_DEV_HANDLE_WHITELIST,
} from "../email.const";

@Injectable()
class EmailTransporter {
  private logger: Logger = new Logger(EmailTransporter.name);
  private transporter: Transporter;

  constructor(
    @Inject(NodemailerConfig.KEY)
    private readonly nodemailerConfig: ConfigType<typeof NodemailerConfig>,
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>
  ) {
    const { service, host, port, secure, user, pass } = nodemailerConfig;
    this.transporter = createTransport({
      service,
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  public async sendMail(
    user: DbUser,
    mailOptions: SendMailOptions
  ): Promise<SendResult> {
    if (this.appConfig.nodeEnv !== "production") {
      // hardcode the recipient to be joannechen1223 and swh00tw in dev environment
      if (!EMAIL_DEV_HANDLE_WHITELIST.includes(user.handle)) {
        return { success: true, skip: true };
      }
    }

    let retryCount = 0;

    while (retryCount < EMAIL_RETRY_LIMIT) {
      try {
        await this.transporter.sendMail(mailOptions);
        return { success: true };
      } catch (error) {
        retryCount++;
        this.logger.error(
          `[Attempt ${retryCount}] Failed to send email ${user.id}: ${error}`
        );

        // avoid rate limit
        await sleep(EMAIL_RETRY_DURATION_MS);
      }
    }

    // throw error if failed after retry limit
    throw new RecnetError(
      ErrorCode.EMAIL_SEND_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      `Failed to send email ${mailOptions.to}`
    );
  }
}

export default EmailTransporter;
