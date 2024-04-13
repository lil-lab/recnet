import { Controller, Get } from "@nestjs/common";

import { EmailService } from "./email.service";

@Controller("mail")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get("test")
  public async testSendingWeeklyDigest(): Promise<{
    result: "success";
  }> {
    // for testing purposes, hard code the user id
    return this.emailService.sendWeeklyDigest("YOUR_USER_ID");
  }
}
