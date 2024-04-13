import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { render } from "@react-email/render";
import groupBy from "lodash.groupby";
import { Resend } from "resend";

import { ResendConfig } from "@recnet-api/config/common.config";
import RecRepository from "@recnet-api/database/repository/rec.repository";
import {
  Rec as DbRec,
  RecFilterBy,
} from "@recnet-api/database/repository/rec.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";
import WeeklyDigest from "@recnet-api/emails/WeeklyDigest";
import { Rec } from "@recnet-api/modules/rec/entities/rec.entity";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

const MAX_REC_PER_MAIL = 5;

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(
    @Inject(ResendConfig.KEY)
    private resendConfig: ConfigType<typeof ResendConfig>,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(RecRepository)
    private readonly recRepository: RecRepository
  ) {
    this.resend = new Resend(this.resendConfig.apiKey);
  }

  public async sendWeeklyDigest(id: string): Promise<{ result: "success" }> {
    console.log(`Sending weekly digest email for user ${id}`);
    const user = await this.userRepository.findUserById(id);
    const followings = user.following.map((following) => following.followingId);
    const filter: RecFilterBy = {
      userIds: followings,
      cutoff: getLatestCutOff(),
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
    try {
      await this.resend.emails.send({
        // TODO: change the from email address,
        // should use this format and must be xxx@recnet.io
        from: "RecNet <shu-wei@recnet.io>",
        to: user.email,
        subject: "Your weekly digest from RecNet",
        html: render(
          WeeklyDigest({
            recsGroupByTitle: recsGroupByTitle,
          })
        ),
      });
      return { result: "success" };
    } catch (e) {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.BAD_REQUEST,
        `Failed to send weekly digest email for user ${id}: ${e}`
      );
    }
  }

  // maybe redirectly use the function in rec.service?
  // need to remove "private" and change to "public" if so
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
