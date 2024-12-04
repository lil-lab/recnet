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

import { announcementSchema, recSchema } from "@recnet/recnet-api-model";

import { WeeklyDigestContent } from "./subscription.type";

import { EmailService } from "../email/email.service";
import { SlackService } from "../slack/slack.service";

function getMockWeeklyDigestData(): WeeklyDigestContent {
  const getMockRec = (title = 1) =>
    generateMock(recSchema, {
      stringMap: {
        photoUrl: () => "https://avatar.iran.liara.run/public",
        title: () => `Paper Title ${title}`,
      },
    });
  const announcement = generateMock(announcementSchema, {
    stringMap: {
      content: () => "This is a test announcement!",
    },
  });
  return {
    recs: [getMockRec(), getMockRec(2), getMockRec(3), getMockRec()],
    numUnusedInviteCodes: 3,
    latestAnnouncement: {
      ...announcement,
      startAt: new Date(announcement.startAt),
      endAt: new Date(announcement.endAt),
    },
  };
}

@ApiTags("subscriptions")
@Controller("subscriptions")
export class SubscriptionController {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
    private readonly slackService: SlackService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository
  ) {}

  /* Development only */
  @ApiOperation({
    summary:
      "[Dev only] Send slack weekly digest slack to the designated user.",
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
  public async testSendingSlackWeeklyDigest(
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
    const content = getMockWeeklyDigestData();

    this.slackService.sendWeeklyDigest(user, content, cutoff);
  }

  @ApiOperation({
    summary:
      "[Dev only] Send email weekly digest slack to the designated user.",
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
  @Post("email/test")
  public async testSendingEmailWeeklyDigest(
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
    const content = getMockWeeklyDigestData();

    this.emailService.sendWeeklyDigest(user, content, cutoff);
  }
}
