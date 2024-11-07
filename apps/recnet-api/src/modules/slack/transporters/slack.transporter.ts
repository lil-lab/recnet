import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { WebClient } from "@slack/web-api";

import { AppConfig, SlackConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { sleep } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import {
  SLACK_DEV_HANDLE_WHITELIST,
  SLACK_RETRY_DURATION_MS,
  SLACK_RETRY_LIMIT,
} from "../slack.const";
import { SendSlackResult } from "../slack.type";

@Injectable()
export class SlackTransporter {
  private logger: Logger = new Logger(SlackTransporter.name);
  private readonly client: WebClient;

  constructor(
    @Inject(SlackConfig.KEY)
    private readonly slackConfig: ConfigType<typeof SlackConfig>,
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>
  ) {
    this.client = new WebClient(this.slackConfig.token);
  }

  public async sendDirectMessage(
    user: DbUser,
    message: string
  ): Promise<SendSlackResult> {
    if (
      this.appConfig.nodeEnv !== "production" &&
      !SLACK_DEV_HANDLE_WHITELIST.includes(user.handle)
    ) {
      // hardcode the recipient to be joannechen1223 and swh00tw in dev environment
      return { success: true, skip: true };
    }

    let retryCount = 0;
    while (retryCount < SLACK_RETRY_LIMIT) {
      try {
        const slackId = await this.getUserSlackId(user);
        await this.postDirectMessage(slackId, message);
        return { success: true };
      } catch (error) {
        retryCount++;
        this.logger.error(
          `[Attempt ${retryCount}] Failed to send email ${user.id}: ${error}`
        );

        // avoid rate limit
        await sleep(SLACK_RETRY_DURATION_MS);
      }
    }

    // throw error if failed after retry limit
    throw new RecnetError(
      ErrorCode.SLACK_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      `Failed to send slack ${user.id}`
    );
  }

  private async getUserSlackId(user: DbUser): Promise<string> {
    const email = user.slackEmail || user.email;
    const userResp = await this.client.users.lookupByEmail({ email });
    const slackId = userResp?.user?.id;
    if (!slackId) {
      throw new RecnetError(
        ErrorCode.SLACK_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to get Slack ID`
      );
    }
    return slackId;
  }

  private async postDirectMessage(
    userSlackId: string,
    message: string
  ): Promise<void> {
    // Open a direct message conversation
    const conversationResp = await this.client.conversations.open({
      users: userSlackId,
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