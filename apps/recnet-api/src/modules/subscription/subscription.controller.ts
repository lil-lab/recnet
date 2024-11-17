import { generateMock } from "@anatine/zod-mock";
import { Body, Controller, HttpStatus, Inject, Post } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { AppConfig } from "@recnet-api/config/common.config";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import { announcementSchema } from "@recnet/recnet-api-model";

import { WeeklyDigestWorker } from "./weekly-digest.worker";

import { SlackService } from "../slack/slack.service";

@ApiTags("subscriptions")
@Controller("subscriptions")
export class SubscriptionController {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
    private readonly slackService: SlackService,
    private readonly userRepository: UserRepository,
    private readonly weeklyDigestWorker: WeeklyDigestWorker
  ) {}

  /* Development only */
  @ApiOperation({
    summary: "Send weekly digest slack to the designated user.",
    description: "This endpoint is for development only.",
  })
  @ApiCreatedResponse()
  @ApiBody({
    schema: {
      properties: {
        userId: { type: "string" },
      },
      required: ["userId"],
    },
  })
  @Post("slack/test")
  public async testSendingWeeklyDigest(
    @Body("userId") userId: string
  ): Promise<void> {
    if (this.appConfig.nodeEnv === "production") {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "This endpoint is only for development"
      );
    }
    const cutoff = getLatestCutOff();
    const user = await this.userRepository.findUserById(userId);
    const announcement = generateMock(announcementSchema);
    const content = await this.weeklyDigestWorker.getWeeklyDigestContent(
      user,
      cutoff,
      {
        ...announcement,
        startAt: new Date(announcement.startAt),
        endAt: new Date(announcement.endAt),
      }
    );

    this.slackService.sendWeeklyDigest(user, content, cutoff);
  }
}
