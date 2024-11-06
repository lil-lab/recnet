import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { render } from "@react-email/render";
import groupBy from "lodash.groupby";

import { AppConfig, NodemailerConfig } from "@recnet-api/config/common.config";
import { User as DbUser } from "@recnet-api/database/repository/user.repository.type";
import { WeeklyDigestContent } from "@recnet-api/modules/subscription/subscription.type";

import { MAIL_TRANSPORTER } from "./email.const";
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
    private transporter: Transporter
  ) {}

  public async sendWeeklyDigest(
    user: DbUser,
    content: WeeklyDigestContent,
    cutoff: Date
  ): Promise<SendMailResult> {
    const recsGroupByTitle = groupBy(content.recs, (rec) => {
      const titleLowercase = rec.article.title.toLowerCase();
      const words = titleLowercase.split(" ").filter((w) => w.length > 0);
      return words.join("");
    });

    // send email
    const mailOptions = {
      from: this.nodemailerConfig.user,
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
