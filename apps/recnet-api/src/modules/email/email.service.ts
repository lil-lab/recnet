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

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import {
  MAIL_TRANSPORTER,
  MAX_REC_PER_MAIL,
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
      const promises = users.map((user) => this.sendWeeklyDigest(user, cutoff));
      const results = await Promise.all(promises);

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
    return this.sendWeeklyDigest(user, cutoff);
  }

  private async sendWeeklyDigest(
    user: DbUser,
    cutoff: Date
  ): Promise<SendMailResult> {
    const followings = user.following.map(
      (following: { followingId: string }) => following.followingId
    );
    const filter: RecFilterBy = {
      userIds: followings,
      cutoff,
    };

    // cap the number of recs to send in an email by MAX_REC_PER_MAIL
    const dbRecs = await this.recRepository.findRecs(
      1,
      MAX_REC_PER_MAIL,
      filter
    );
    const recs = dbRecs.map(this.getRecFromDbRec);
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
        numFollowers: dbRec.user.followedBy.length,
      },
    };
  }
}
