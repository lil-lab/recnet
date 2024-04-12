import { Controller, Get } from "@nestjs/common";

import { EmailService } from "./email.service";

@Controller("mail")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  healthCheck(): { result: "success" | "failed" } {
    return this.emailService.sendEmail();
  }
}
