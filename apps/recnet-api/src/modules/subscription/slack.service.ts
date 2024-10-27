import { Injectable } from "@nestjs/common";

import UserRepository from "@recnet-api/database/repository/user.repository";

@Injectable()
export class SlackService {
  constructor(private readonly userRepository: UserRepository) {}

  public async sendTestSlackMessage(
    userId: string
  ): Promise<{ success: boolean }> {
    console.log("sendTestSlackMessage", userId);

    return this.sendDirectMessage(userId, "This is a test message");
  }

  private async sendDirectMessage(
    userId: string,
    message: string
  ): Promise<{ success: boolean }> {
    const user = await this.userRepository.findUserById(userId);
    const email = user.slackEmail || user.email;
    console.log("sendDirectMessage", email, message);
    return { success: true };
  }
}
