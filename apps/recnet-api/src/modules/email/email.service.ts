import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  sendEmail(): { result: "success" | "failed" } {
    return { result: "success" };
  }
}
