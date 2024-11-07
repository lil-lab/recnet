import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Channel, CronStatus, SubscriptionType } from "@prisma/client";

import AnnouncementRepository from "@recnet-api/database/repository/announcement.repository";
import InviteCodeRepository from "@recnet-api/database/repository/invite-code.repository";
import RecRepository from "@recnet-api/database/repository/rec.repository";
import { RecFilterBy } from "@recnet-api/database/repository/rec.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import WeeklyDigestCronLogRepository from "@recnet-api/database/repository/weekly-digest-cron-log.repository";
import { transformAnnouncement } from "@recnet-api/modules/announcement/announcement.transform";
import { Announcement } from "@recnet-api/modules/announcement/entities/announcement.entity";
import { EmailService } from "@recnet-api/modules/email/email.service";
import { Rec } from "@recnet-api/modules/rec/entities/rec.entity";
import { transformRec } from "@recnet-api/modules/rec/rec.transformer";
import { SlackService } from "@recnet-api/modules/slack/slack.service";
import { sleep } from "@recnet-api/utils";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import {
  MAX_REC_PER_DIGEST,
  SLEEP_DURATION_MS,
  WEEKLY_DIGEST_CRON,
} from "./subscription.const";
import { SendResult, WeeklyDigestContent } from "./subscription.type";

@Injectable()
export class WeeklyDigestWorker {
  private readonly logger = new Logger(WeeklyDigestWorker.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly recRepository: RecRepository,
    private readonly weeklyDigestCronLogRepository: WeeklyDigestCronLogRepository,
    private readonly inviteCodeRepository: InviteCodeRepository,
    private readonly announcementRepository: AnnouncementRepository,
    private readonly emailService: EmailService,
    private readonly slackService: SlackService
  ) {}

  @Cron(WEEKLY_DIGEST_CRON, { utcOffset: 0 })
  public async weeklyDigestCron(): Promise<void> {
    this.logger.log("Start weekly digest cron");
    const cutoff = getLatestCutOff();
    const cronLog =
      await this.weeklyDigestCronLogRepository.createWeeklyDigestCronLog(
        cutoff
      );

    try {
      // in-memory cache key: userId, value: weekly digest content
      // const weeklyDigestContentCache = new Map<string, WeeklyDigestContent>();

      const latestAnnouncement = await this.getLatestAnnouncement();

      // send email
      const emailResult = await this.sendEmailDigests(
        cutoff,
        latestAnnouncement
      );

      this.logger.log(
        `Finish sending weekly digest email: ${emailResult.successCount} emails sent, ${emailResult.errorUserIds.length} errors`
      );

      // send slack
      const slackResult = await this.sendSlackDigests(
        cutoff,
        latestAnnouncement
      );

      this.logger.log(
        `Finish sending weekly digest slack: ${slackResult.successCount} slack sent, ${slackResult.errorUserIds.length} errors`
      );

      // log the successful result to DB
      await this.weeklyDigestCronLogRepository.endWeeklyDigestCron(cronLog.id, {
        status: CronStatus.SUCCESS,
        result: { email: emailResult, slack: slackResult },
      });
    } catch (error) {
      this.logger.error(`Error in weekly digest cron: ${error}`);

      // log the failed result to DB
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await this.weeklyDigestCronLogRepository.endWeeklyDigestCron(cronLog.id, {
        status: CronStatus.FAILURE,
        errorMsg,
      });
    }
  }

  private async sendEmailDigests(
    cutoff: Date,
    latestAnnouncement: Announcement | undefined
  ): Promise<{
    successCount: number;
    errorUserIds: string[];
  }> {
    const results: Array<SendResult> = [];
    const emailSubscribers = await this.userRepository.findUsersBySubscription({
      type: SubscriptionType.WEEKLY_DIGEST,
      channel: Channel.EMAIL,
    });

    for (const subscriber of emailSubscribers) {
      const weeklyDigestContent = await this.getWeeklyDigestContent(
        subscriber,
        cutoff,
        latestAnnouncement
      );

      if (weeklyDigestContent.recs.length === 0) {
        results.push({ success: true, skip: true });
        continue;
      }

      const result = await this.emailService.sendWeeklyDigest(
        subscriber,
        weeklyDigestContent,
        cutoff
      );
      results.push(result);

      // avoid rate limit
      await sleep(SLEEP_DURATION_MS);
    }

    return this.transformSendResults(results);
  }

  private async sendSlackDigests(
    cutoff: Date,
    latestAnnouncement: Announcement | undefined
  ): Promise<{
    successCount: number;
    errorUserIds: string[];
  }> {
    const results: Array<SendResult> = [];
    const slackSubscribers = await this.userRepository.findUsersBySubscription({
      type: SubscriptionType.WEEKLY_DIGEST,
      channel: Channel.SLACK,
    });

    for (const subscriber of slackSubscribers) {
      const weeklyDigestContent = await this.getWeeklyDigestContent(
        subscriber,
        cutoff,
        latestAnnouncement
      );

      if (weeklyDigestContent.recs.length === 0) {
        results.push({ success: true, skip: true });
        continue;
      }

      const result = await this.slackService.sendWeeklyDigest(
        subscriber,
        weeklyDigestContent,
        cutoff
      );
      results.push(result);

      // avoid rate limit
      await sleep(SLEEP_DURATION_MS);
    }

    return this.transformSendResults(results);
  }

  private async getWeeklyDigestContent(
    user: DbUser,
    cutoff: Date,
    latestAnnouncement: Announcement | undefined
  ): Promise<WeeklyDigestContent> {
    return {
      recs: await this.getRecsForUser(user, cutoff),
      numUnusedInviteCodes: await this.inviteCodeRepository.countInviteCodes({
        used: false,
        ownerId: user.id,
      }),
      latestAnnouncement,
    };
  }

  private async getRecsForUser(user: DbUser, cutoff: Date): Promise<Rec[]> {
    const followings = user.following.map(
      (following: { followingId: string }) => following.followingId
    );
    const filter: RecFilterBy = {
      userIds: followings,
      cutoff,
    };

    const dbRecs = await this.recRepository.findRecs(
      1,
      MAX_REC_PER_DIGEST,
      filter
    );

    return dbRecs.map((dbRec) => transformRec(dbRec));
  }

  private async getLatestAnnouncement(): Promise<Announcement | undefined> {
    const currentActivatedAnnouncements =
      await this.announcementRepository.findAnnouncements(1, 1, {
        activatedOnly: true,
        currentOnly: true,
      });
    return currentActivatedAnnouncements.length > 0
      ? transformAnnouncement(currentActivatedAnnouncements[0])
      : undefined;
  }

  private transformSendResults(results: SendResult[]): {
    successCount: number;
    errorUserIds: string[];
  } {
    const successCount = results.filter(
      (result) => result.success && !result.skip
    ).length;
    const errorUserIds = results
      .filter((result) => !result.success)
      .map((result) => result.userId)
      .filter((userId) => userId !== undefined) as string[];
    return { successCount, errorUserIds };
  }
}
