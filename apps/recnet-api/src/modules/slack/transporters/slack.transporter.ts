import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { WebClient } from "@slack/web-api";
import axios from "axios";
import get from "lodash.get";

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
import {
  SendSlackResult,
  SlackMessageBlocks,
  SlackOauthInfo,
} from "../slack.type";

const SLACK_OAUTH_ACCESS_API = "https://slack.com/api/oauth.v2.access";

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
    this.client = new WebClient();
  }

  public async accessOauthInfo(
    userId: string,
    code: string
  ): Promise<SlackOauthInfo> {
    const formData = new FormData();
    formData.append("client_id", this.slackConfig.clientId);
    formData.append("client_secret", this.slackConfig.clientSecret);
    formData.append("code", code);

    try {
      const { data } = await axios.post(SLACK_OAUTH_ACCESS_API, formData);
      if (!data.ok) {
        throw new RecnetError(
          ErrorCode.SLACK_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Failed to access oauth info: ${data.error}`
        );
      }
      return {
        slackAccessToken: get(data, "access_token", ""),
        slackUserId: get(data, "authed_user.id", ""),
        slackWorkspaceName: get(data, "team.name", ""),
      };
    } catch (error) {
      this.logger.error(
        `Failed to access oauth info, userId: ${userId}, error: ${error}`
      );
      throw error;
    }
  }

  public async sendDirectMessage(
    user: DbUser,
    message: SlackMessageBlocks,
    notificationText?: string
  ): Promise<SendSlackResult> {
    if (
      this.appConfig.nodeEnv !== "production" &&
      !SLACK_DEV_HANDLE_WHITELIST.includes(user.handle)
    ) {
      // hardcode the recipient whitelist in dev environment
      return { success: true, skip: true };
    }

    let retryCount = 0;
    while (retryCount < SLACK_RETRY_LIMIT) {
      try {
        const slackId = await this.getUserSlackId(user);
        await this.postDirectMessage(slackId, message, notificationText);
        return { success: true };
      } catch (error) {
        retryCount++;
        this.logger.error(
          `[Attempt ${retryCount}] Failed to send slack message to ${user.id}: ${error}`
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
    const email = user.email;
    const userResp = await this.client.users.lookupByEmail({
      email,
      token: this.slackConfig.token,
    });
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
    message: SlackMessageBlocks,
    notificationText?: string
  ): Promise<void> {
    // Open a direct message conversation
    const conversationResp = await this.client.conversations.open({
      users: userSlackId,
      token: this.slackConfig.token,
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
      text: notificationText,
      blocks: message,
      token: this.slackConfig.token,
    });
  }
}
