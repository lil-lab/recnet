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
      const latestAnnouncement = await this.getLatestAnnouncement();
      const allUsers = await this.userRepository.findAllUsers();

      const emailResults: SendResult[] = [];
      const slackResults: SendResult[] = [];

      for (const user of allUsers) {
        const weeklyDigestContent = await this.getWeeklyDigestContent(
          user,
          cutoff,
          latestAnnouncement
        );

        if (weeklyDigestContent.recs.length === 0) {
          continue;
        }

        // send email
        const isEmailSubscribed = user.subscriptions.some(
          (sub) =>
            sub.type === SubscriptionType.WEEKLY_DIGEST &&
            sub.channel === Channel.EMAIL
        );
        if (isEmailSubscribed) {
          const result = await this.emailService.sendWeeklyDigest(
            user,
            weeklyDigestContent,
            cutoff
          );
          emailResults.push(result);
        }

        // send slack
        const isSlackSubscribed = user.subscriptions.some(
          (sub) =>
            sub.type === SubscriptionType.WEEKLY_DIGEST &&
            sub.channel === Channel.SLACK
        );
        if (isSlackSubscribed) {
          const result = await this.slackService.sendWeeklyDigest(
            user,
            weeklyDigestContent,
            cutoff
          );
          slackResults.push(result);
        }

        // avoid rate limit
        await sleep(SLEEP_DURATION_MS);
      }

      const emailSummarizedResult = this.summarizeSendResults(emailResults);
      const slackSummarizedResult = this.summarizeSendResults(slackResults);

      this.logger.log(
        `Weekly digest cron completed: ${emailSummarizedResult.successCount} emails sent, ${emailSummarizedResult.errorUserIds.length} errors. ${slackSummarizedResult.successCount} slack messages sent, ${slackSummarizedResult.errorUserIds.length} errors.`
      );

      // log the successful result to DB
      await this.weeklyDigestCronLogRepository.endWeeklyDigestCron(cronLog.id, {
        status: CronStatus.SUCCESS,
        result: {
          email: emailSummarizedResult,
          slack: slackSummarizedResult,
        },
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

  private summarizeSendResults(results: SendResult[]): {
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
