import { Inject, Injectable, Logger } from "@nestjs/common";
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
import { sleep } from "@recnet-api/utils";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import {
  MAX_REC_PER_DIGEST,
  SLEEP_DURATION_MS,
  WEEKLY_DIGEST_CRON,
} from "./subscription.const";

@Injectable()
export class WeeklyDigestWorker {
  private readonly logger = new Logger(WeeklyDigestWorker.name);

  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(RecRepository)
    private readonly recRepository: RecRepository,
    @Inject(WeeklyDigestCronLogRepository)
    private readonly weeklyDigestCronLogRepository: WeeklyDigestCronLogRepository,
    @Inject(InviteCodeRepository)
    private readonly inviteCodeRepository: InviteCodeRepository,
    @Inject(AnnouncementRepository)
    private readonly announcementRepository: AnnouncementRepository,
    @Inject(EmailService)
    private readonly emailService: EmailService
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
      const emailResults = [];
      const emailSubscribers =
        await this.userRepository.findUsersBySubscription({
          type: SubscriptionType.WEEKLY_DIGEST,
          channel: Channel.EMAIL,
        });

      for (const subscriber of emailSubscribers) {
        const weeklyDigestContent = {
          recs: await this.getRecsForUser(subscriber, cutoff),
          numUnusedInviteCodes:
            await this.inviteCodeRepository.countInviteCodes({
              used: false,
              ownerId: subscriber.id,
            }),
          latestAnnouncement,
        };

        if (weeklyDigestContent.recs.length === 0) {
          emailResults.push({ success: true, skip: true });
          continue;
        }

        const result = await this.emailService.sendWeeklyDigest(
          subscriber,
          weeklyDigestContent,
          cutoff
        );
        emailResults.push(result);

        // avoid rate limit
        await sleep(SLEEP_DURATION_MS);
      }

      const successCount = emailResults.filter(
        (result) => result.success && !result.skip
      ).length;
      const errorUserIds = emailResults
        .filter((result) => !result.success)
        .map((result) => result.userId)
        .filter((userId) => userId !== undefined) as string[];

      // log the successful result to DB
      await this.weeklyDigestCronLogRepository.endWeeklyDigestCron(cronLog.id, {
        status: CronStatus.SUCCESS,
        result: { email: { successCount, errorUserIds } },
      });
      this.logger.log(
        `Finish weekly digest cron: ${successCount} emails sent, ${errorUserIds.length} errors`
      );
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
}
