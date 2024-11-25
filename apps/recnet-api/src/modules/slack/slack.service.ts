import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";

import { AppConfig, SlackConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { WeeklyDigestContent } from "@recnet-api/modules/subscription/subscription.type";
import { decrypt, encrypt } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { SendSlackResult, SlackOauthInfo } from "./slack.type";
import { weeklyDigestSlackTemplate } from "./templates/weekly-digest.template";
import { SlackTransporter } from "./transporters/slack.transporter";

@Injectable()
export class SlackService {
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
    const slackOauthInfo = await this.transporter.accessOauthInfo(userId, code);
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
