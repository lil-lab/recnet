import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Resend } from "resend";

import { ResendConfig } from "@recnet-api/config/common.config";

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(
    @Inject(ResendConfig.KEY)
    private resendConfig: ConfigType<typeof ResendConfig>
  ) {
    this.resend = new Resend(this.resendConfig.apiKey);
  }

  sendWeeklyDigest(id: string): { result: "success" | "failed" } {
    console.log(`Sending weekly digest email for user ${id}`);
    return { result: "success" };
  }
}
