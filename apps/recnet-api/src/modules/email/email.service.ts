import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { CronStatus } from "@prisma/client";
import { render } from "@react-email/render";
import groupBy from "lodash.groupby";

import { AppConfig, NodemailerConfig } from "@recnet-api/config/common.config";
import RecRepository from "@recnet-api/database/repository/rec.repository";
import {
  Rec as DbRec,
  RecFilterBy,
} from "@recnet-api/database/repository/rec.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import WeeklyDigestCronLogRepository from "@recnet-api/database/repository/weekly-digest-cron-log.repository";
import { Rec } from "@recnet-api/modules/rec/entities/rec.entity";
import { sleep } from "@recnet-api/utils";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import {
  MAIL_TRANSPORTER,
  MAX_REC_PER_MAIL,
  SLEEP_DURATION_MS,
  WEEKLY_DIGEST_CRON,
} from "./email.const";
import { SendMailResult, Transporter } from "./email.type";
import WeeklyDigest, { WeeklyDigestSubject } from "./templates/WeeklyDigest";

@Injectable()
export class EmailService {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
    @Inject(NodemailerConfig.KEY)
    private readonly nodemailerConfig: ConfigType<typeof NodemailerConfig>,
    @Inject(MAIL_TRANSPORTER)
    private transporter: Transporter,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(RecRepository)
    private readonly recRepository: RecRepository,
    @Inject(WeeklyDigestCronLogRepository)
    private readonly weeklyDigestCronLogRepository: WeeklyDigestCronLogRepository
  ) {}

  @Cron(WEEKLY_DIGEST_CRON, { utcOffset: 0 })
  public async weeklyDigestCron(): Promise<void> {
    const logger = new Logger("WeeklyDigestCron");

    logger.log("Start weekly digest cron");
    const cutoff = getLatestCutOff();
    const cronLog =
      await this.weeklyDigestCronLogRepository.createWeeklyDigestCronLog(
        cutoff
      );

    try {
      const users = await this.userRepository.findAllUsers();
      const results = [];

      for (const user of users) {
        const recs = await this.getRecsForUser(user, cutoff);
        if (recs.length === 0) {
          results.push({ success: true, skip: true });
          continue;
        }

        const result = await this.sendWeeklyDigest(user, recs, cutoff);
        results.push(result);

        // avoid rate limit
        await sleep(SLEEP_DURATION_MS);
      }

      const successCount = results.filter(
        (result) => result.success && !result.skip
      ).length;
      const errorUserIds = results
        .filter((result) => !result.success)
        .map((result) => result.userId)
        .filter((userId) => userId !== undefined) as string[];

      // log the successful result to DB
      await this.weeklyDigestCronLogRepository.endWeeklyDigestCron(cronLog.id, {
        status: CronStatus.SUCCESS,
        result: { successCount, errorUserIds },
      });
      logger.log(
        `Finish weekly digest cron: ${successCount} emails sent, ${errorUserIds.length} errors`
      );
    } catch (error) {
      logger.error(`Error in weekly digest cron: ${error}`);

      // log the failed result to DB
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await this.weeklyDigestCronLogRepository.endWeeklyDigestCron(cronLog.id, {
        status: CronStatus.FAILURE,
        errorMsg,
      });
    }
  }

  public async sendTestEmail(userId: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findUserById(userId);
    const cutoff = getLatestCutOff();
    const recs = await this.getRecsForUser(user, cutoff);
    return this.sendWeeklyDigest(user, recs, cutoff);
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
      MAX_REC_PER_MAIL,
      filter
    );
    return dbRecs.map((dbRec) => this.getRecFromDbRec(dbRec));
  }

  private async sendWeeklyDigest(
    user: DbUser,
    recs: Rec[],
    cutoff: Date
  ): Promise<SendMailResult> {
    const recsGroupByTitle = groupBy(recs, (rec) => {
      const titleLowercase = rec.article.title.toLowerCase();
      const words = titleLowercase.split(" ").filter((w) => w.length > 0);
      return words.join("");
    });

    // send email
    const mailOptions = {
      from: this.nodemailerConfig.user,
      to: user.email,
      subject: WeeklyDigestSubject(cutoff, this.appConfig.nodeEnv),
      html: render(WeeklyDigest({ recsGroupByTitle })),
    };

    let result;
    try {
      result = await this.transporter.sendMail(user, mailOptions);
    } catch (e) {
      return { success: false, userId: user.id };
    }

    return result;
  }

  private getRecFromDbRec(dbRec: DbRec): Rec {
    return {
      ...dbRec,
      cutoff: dbRec.cutoff.toISOString(),
      user: {
        id: dbRec.user.id,
        handle: dbRec.user.handle,
        displayName: dbRec.user.displayName,
        photoUrl: dbRec.user.photoUrl,
        affiliation: dbRec.user.affiliation,
        bio: dbRec.user.bio,
        url: dbRec.user.url,
        numFollowers: dbRec.user.followedBy.length,
        numRecs: dbRec.user.recommendations.length,
      },
    };
  }
}
