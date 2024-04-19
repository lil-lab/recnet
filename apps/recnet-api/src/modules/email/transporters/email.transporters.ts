import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { createTransport, Transporter, SendMailOptions } from "nodemailer";

import { NodemailerConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { SendMailResult } from "../email.type";

@Injectable()
class EmailTransporter {
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
    try {
      console.log("Sending email to", user.handle, mailOptions.to);
      // await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new RecnetError(
        ErrorCode.EMAIL_SEND_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to send weekly digest email ${user.id}: ${error}`
      );
    }
    return { success: true };
  }
}

export default EmailTransporter;
