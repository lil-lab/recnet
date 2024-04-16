import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { render } from "@react-email/render";
import groupBy from "lodash.groupby";
import { Transporter } from "nodemailer";

import { AppConfig, NodemailerConfig } from "@recnet-api/config/common.config";
import RecRepository from "@recnet-api/database/repository/rec.repository";
import {
  Rec as DbRec,
  RecFilterBy,
} from "@recnet-api/database/repository/rec.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { Rec } from "@recnet-api/modules/rec/entities/rec.entity";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import { MAIL_TRANSPORTER, MAX_REC_PER_MAIL } from "./email.const";
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
    private readonly recRepository: RecRepository
  ) {}

  public async sendWeeklyDigest(id: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findUserById(id);
    const cutoff = getLatestCutOff();
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
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.response}`);
    } catch (e) {
      throw new RecnetError(
        ErrorCode.EMAIL_SEND_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to send weekly digest email for user ${id}: ${e}`
      );
    }

    return { success: true };
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
