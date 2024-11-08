import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";

import { AppConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { WeeklyDigestContent } from "@recnet-api/modules/subscription/subscription.type";

import { SendSlackResult } from "./slack.type";
import { weeklyDigestSlackTemplate } from "./templates/weekly-digest.template";
import { SlackTransporter } from "./transporters/slack.transporter";

@Injectable()
export class SlackService {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
    private readonly transporter: SlackTransporter
  ) {}

  public async sendWeeklyDigest(
    user: DbUser,
    content: WeeklyDigestContent,
    cutoff: Date
  ): Promise<SendSlackResult> {
    let result;
    try {
      const slackMessage = weeklyDigestSlackTemplate(
        cutoff,
        content,
        this.appConfig.nodeEnv
      );
      result = await this.transporter.sendDirectMessage(user, slackMessage);
    } catch (e) {
      return { success: false, userId: user.id };
    }

    return result;
  }
}
