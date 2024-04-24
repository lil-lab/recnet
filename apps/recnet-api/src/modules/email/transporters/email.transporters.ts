import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { createTransport, Transporter, SendMailOptions } from "nodemailer";

import { NodemailerConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { SendMailResult } from "../email.type";

const hotfixResendUserIds = [
  "89302f40-f4dd-4e26-a3b2-83557b46fc2e",
  "9b2d4416-4495-47de-b02b-b0807c3f7632",
  "f5cbc90c-c5bc-4e3f-92d7-3a8c2b1b1bb8",
  "25ccdefd-6182-45e6-ba09-1ee5da677bb8",
  "2d32a2d6-ea98-41c2-948c-90ff7cf0209b",
  "3a2ff94f-4d68-49b1-858c-5c765e90170a",
  "97a5b3b4-31a2-4a1b-a85b-55dde0a7f23f",
  "67ebf2aa-fc5e-4951-af15-c5d6713a9bcf",
  "a2a580ae-06ff-4583-9a31-6cc5a75153c3",
  "17dcb81a-5edb-4904-ac4f-bb4fb976ddd0",
  "22fe0b24-30d5-4956-8bfb-8e7b4a64f54d",
  "476a238f-21c9-4cf1-a982-4b0e7ebe754a",
  "b3901153-9ab5-48a9-885f-e8d2e235e025",
  "e7f97109-8d10-4a6c-82a0-a588d030162f",
  "febf6639-a38c-46e3-a92f-39718eeed2ce",
  "c45efa4b-d800-4f6e-bff4-27ad8d5ead70",
  "22e879a7-fe11-469d-8212-6cdaed0b32e8",
  "a0fec315-760a-45f7-982f-84ec77542cd6",
  "989d30b2-d173-4feb-969f-859e7956d21a",
  "0d903b12-c799-4f8b-931d-37c7fc722634",
  "2ad151af-1253-4abd-becc-12830164b1a6",
  "699b3bdf-566f-4796-a7e6-0a8c2f688223",
  "92991f40-5e73-4eb7-b0de-55ff1d0cf0fb",
  "271bcc06-edfb-483a-b2db-8b8c967ea929",
  "7ca047c0-6faa-4003-9831-2adae3651955",
  "507a46bf-ed5d-4876-a780-b63c45d8b592",
  "00cbaae6-afc0-4ed8-9704-b47ce7d70488",
  "30a38241-19ea-4702-b847-b6b832b6d4e9",
  "5eb979d8-4598-4eaf-ad62-d56df96bbf54",
  "9f52555f-86be-4c00-bb63-287cd16fe3ec",
  "f6442c46-6e35-43b7-beab-86d77dd021a8",
  "9e7d58dc-db1c-4cb2-ab2a-ebff3d1cb233",
  "935cfc79-3f34-487a-af52-847aa2cff487",
  "745631c8-4455-4f47-8888-a87f239e1d24",
  "d787c451-6141-4bfb-8096-a82f09e9dbcb",
  "a578f809-d88c-4479-9750-0bc8a0d54d49",
  "32ff80fe-d721-43a9-8b55-92180ba86cf2",
  "cc125c32-bc70-41ed-8c49-f5700ce200e9",
  "338a42d2-6edb-40d8-99dd-028d5484810c",
];

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
    // hotfix for resend
    if (!hotfixResendUserIds.includes(user.id)) {
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
        errorMsg
      );
    }
    return { success: true };
  }
}

export default EmailTransporter;
