import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { createTransport, Transporter, SendMailOptions } from "nodemailer";

import { NodemailerConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

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

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      const errorMsg = `Failed to send weekly digest email ${user.id}: ${error}`;
      this.logger.error(errorMsg);

      throw new RecnetError(
        ErrorCode.EMAIL_SEND_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to send weekly digest email ${mailOptions.to}: ${error}`
      );
    }
    return { success: true };
  }
}

export default EmailDevTransporter;
