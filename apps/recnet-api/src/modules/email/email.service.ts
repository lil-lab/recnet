import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  sendEmail(id: string): { result: "success" | "failed" } {
    console.log(`Sending weekly digest email for user ${id}`);
    return { result: "success" };
  }
}
