import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { render } from "@react-email/render";
import groupBy from "lodash.groupby";

import { AppConfig, NodemailerConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import {
  SendResult,
  WeeklyDigestContent,
} from "@recnet-api/modules/subscription/subscription.type";

import WeeklyDigest, { WeeklyDigestSubject } from "./templates/WeeklyDigest";
import EmailTransporter from "./transporters/email.transporter";

@Injectable()
export class EmailService {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
    @Inject(NodemailerConfig.KEY)
    private readonly nodemailerConfig: ConfigType<typeof NodemailerConfig>,
    private transporter: EmailTransporter
  ) {}

  public async sendWeeklyDigest(
    user: DbUser,
    content: WeeklyDigestContent,
    cutoff: Date
  ): Promise<SendResult> {
    const recsGroupByTitle = groupBy(content.recs, (rec) => {
      const titleLowercase = rec.article.title.toLowerCase();
      const words = titleLowercase.split(" ").filter((w) => w.length > 0);
      return words.join("");
    });

    // send email
    const mailOptions = {
      from: `RecNet<${this.nodemailerConfig.user}>`,
      to: user.email,
      subject: WeeklyDigestSubject(cutoff, this.appConfig.nodeEnv),
      html: render(
        WeeklyDigest({
          env: this.appConfig.nodeEnv,
          recsGroupByTitle,
          numUnusedInviteCodes: content.numUnusedInviteCodes,
          latestAnnouncement: content.latestAnnouncement,
        })
      ),
    };

    let result;
    try {
      result = await this.transporter.sendMail(user, mailOptions);
    } catch (e) {
      return { success: false, userId: user.id };
    }

    return result;
  }
}
