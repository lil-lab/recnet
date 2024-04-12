import { Controller, Get } from "@nestjs/common";

import { EmailService } from "./email.service";

@Controller("mail")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get("test")
  testSendingWeeklyDigest(): { result: "success" | "failed" } {
    // for testing purposes, hard code the user id
    return this.emailService.sendWeeklyDigest(
      "507a46bf-ed5d-4876-a780-b63c45d8b592"
    );
  }
}
