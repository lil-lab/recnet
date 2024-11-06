import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { createTransport, Transporter, SendMailOptions } from "nodemailer";

import { NodemailerConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { sleep } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { RETRY_LIMIT, RETRY_DURATION_MS } from "../email.const";
import { SendMailResult } from "../email.type";

@Injectable()
class EmailTransporter {
  private logger: Logger = new Logger(EmailTransporter.name);
  private transporter: Transporter;

  constructor(
    @Inject(NodemailerConfig.KEY)
    private readonly nodemailerConfig: ConfigType<typeof NodemailerConfig>
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
  ): Promise<SendMailResult> {
    let retryCount = 0;

    while (retryCount < RETRY_LIMIT) {
      try {
        await this.transporter.sendMail(mailOptions);
        return { success: true };
      } catch (error) {
        retryCount++;
        this.logger.error(
          `[Attempt ${retryCount}] Failed to send email ${user.id}: ${error}`
        );

        // avoid rate limit
        await sleep(RETRY_DURATION_MS);
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
