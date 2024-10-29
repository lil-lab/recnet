import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { WebClient } from "@slack/web-api";

import { SlackConfig } from "@recnet-api/config/common.config";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

@Injectable()
export class SlackService {
  private readonly client: WebClient;

  constructor(
    @Inject(SlackConfig.KEY)
    private readonly slackConfig: ConfigType<typeof SlackConfig>,
    private readonly userRepository: UserRepository
  ) {
    this.client = new WebClient(this.slackConfig.token);
  }

  public async sendDirectMessage(
    userId: string,
    message: string
  ): Promise<void> {
    const user = await this.userRepository.findUserById(userId);
    const email = user.slackEmail || user.email;

    // Get the user's Slack ID
    const userResp = await this.client.users.lookupByEmail({ email });
    const slackId = userResp?.user?.id;
    if (!slackId) {
      throw new RecnetError(
        ErrorCode.SLACK_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to get Slack ID`
      );
    }

    // Open a direct message conversation
    const conversationResp = await this.client.conversations.open({
      users: slackId,
    });
    const conversationId = conversationResp?.channel?.id;
    if (!conversationId) {
      throw new RecnetError(
        ErrorCode.SLACK_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to open conversation`
      );
    }

    // Send the message
    await this.client.chat.postMessage({
      channel: conversationId,
      text: message,
    });
  }
}
