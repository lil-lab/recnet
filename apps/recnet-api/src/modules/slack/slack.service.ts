import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import axios from "axios";
import get from "lodash.get";

import { AppConfig, SlackConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { WeeklyDigestContent } from "@recnet-api/modules/subscription/subscription.type";
import { decrypt, encrypt } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { SendSlackResult, SlackOauthInfo } from "./slack.type";
import { weeklyDigestSlackTemplate } from "./templates/weekly-digest.template";
import { SlackTransporter } from "./transporters/slack.transporter";

const SLACK_OAUTH_ACCESS_API = "https://slack.com/api/oauth.v2.access";

@Injectable()
export class SlackService {
  private logger: Logger = new Logger(SlackService.name);

  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
    @Inject(SlackConfig.KEY)
    private readonly slackConfig: ConfigType<typeof SlackConfig>,
    private readonly transporter: SlackTransporter
  ) {}

  public async installApp(
    userId: string,
    code: string
  ): Promise<SlackOauthInfo> {
    const slackOauthInfo = await this.accessOauthInfo(userId, code);
    await this.validateSlackOauthInfo(userId, slackOauthInfo);

    // encrypt access token
    slackOauthInfo.slackAccessToken = encrypt(
      slackOauthInfo.slackAccessToken,
      this.slackConfig.tokenEncryptionKey
    );
    return slackOauthInfo;
  }

  public async sendWeeklyDigest(
    user: DbUser,
    content: WeeklyDigestContent,
    cutoff: Date
  ): Promise<SendSlackResult> {
    let result;
    try {
      const weeklyDigest = weeklyDigestSlackTemplate(
        cutoff,
        content,
        this.appConfig.nodeEnv
      );
      const decryptedAccessToken = user.slackAccessToken
        ? decrypt(user.slackAccessToken, this.slackConfig.tokenEncryptionKey)
        : "";
      result = await this.transporter.sendDirectMessage(
        user,
        decryptedAccessToken,
        weeklyDigest.messageBlocks,
        weeklyDigest.notificationText
      );
    } catch (e) {
      return { success: false, userId: user.id };
    }

    return result;
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

  private async validateSlackOauthInfo(
    userId: string,
    slackOauthInfo: SlackOauthInfo
  ): Promise<void> {
    let errorMsg = "";
    if (slackOauthInfo.slackAccessToken === "") {
      errorMsg = "Failed to get access token, userId: " + userId;
    } else if (slackOauthInfo.slackUserId === "") {
      errorMsg = "Failed to get user id, userId: " + userId;
    } else if (slackOauthInfo.slackWorkspaceName === "") {
      errorMsg = "Failed to get workspace name, userId: " + userId;
    }
    if (errorMsg !== "") {
      throw new RecnetError(
        ErrorCode.SLACK_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to get workspace name`
      );
    }
  }
}
