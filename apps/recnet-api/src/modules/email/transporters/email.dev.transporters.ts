import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { createTransport, Transporter, SendMailOptions } from "nodemailer";

import { NodemailerConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { sleep } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { SLEEP_DURATION_MS } from "../email.const";
import { SendMailResult } from "../email.type";

const devHandleWhitelist = ["joannechen1223", "swh00tw"];

@Injectable()
class EmailDevTransporter {
  private logger: Logger = new Logger(EmailDevTransporter.name);
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
    // hardcode the recipient to be joannechen1223 and swh00tw in dev environment
    if (!devHandleWhitelist.includes(user.handle)) {
      return { success: true, skip: true };
    }

    let retryCount = 0;
    while (retryCount < 3) {
      try {
        await this.transporter.sendMail(mailOptions);
        return { success: true };
      } catch (error) {
        retryCount++;
        this.logger.error(
          `[Attempt ${retryCount}] Failed to send email ${user.id}: ${error}`
        );

        // avoid rate limit
        await sleep(SLEEP_DURATION_MS);
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

export default EmailDevTransporter;
