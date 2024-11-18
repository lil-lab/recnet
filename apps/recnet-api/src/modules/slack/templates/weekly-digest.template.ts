import groupBy from "lodash.groupby";
import { BlockCollection, Md, Blocks, BlockBuilder } from "slack-block-builder";

import { WeeklyDigestContent } from "@recnet-api/modules/subscription/subscription.type";

import { formatDate } from "@recnet/recnet-date-fns";

import type { SlackMessageBlocks } from "../slack.type";

export type WeeklyDigestDto = {
  notificationText?: string;
  messageBlocks: SlackMessageBlocks;
};

export const weeklyDigestSlackTemplate = (
  cutoff: Date,
  content: WeeklyDigestContent,
  nodeEnv: string
): WeeklyDigestDto => {
  const { recs, numUnusedInviteCodes, latestAnnouncement } = content;

  const recsGroupByTitle = groupBy(recs, (rec) => {
    const titleLowercase = rec.article.title.toLowerCase();
    const words = titleLowercase.split(" ").filter((w) => w.length > 0);
    return words.join("");
  });
  const recSection = Object.values(recsGroupByTitle).map((recs) => {
    const article = recs[0].article;
    return [
      Blocks.Section({
        text: `${Md.bold(Md.link(article.link, article.title))}\n${Md.italic(article.author)} - ${article.year}`,
      }),
      ...recs.map((rec) =>
        Blocks.Section({
          text: `${Md.link(`https://recnet.io/${rec.user.handle}`, rec.user.displayName)}${rec.isSelfRec ? Md.italic("(Self-Rec)") : ""}: ${rec.description} (${Md.link(`https://recnet.io/rec/${rec.id}`, "view")})`,
        })
      ),
      Blocks.Divider(),
    ];
  });

  const footer: BlockBuilder[] = [];
  if (numUnusedInviteCodes > 0) {
    footer.push(
      Blocks.Section({
        text: `❤️ You have ${Md.bold(`${numUnusedInviteCodes}`)} unused invite codes. Share the love!`,
      })
    );
  }
  if (latestAnnouncement) {
    footer.push(
      Blocks.Section({
        text: `📢 Announcement - ${latestAnnouncement.title}: ${latestAnnouncement.content}`,
      })
    );
  }

  const messageBlocks = BlockCollection(
    // headers: number of rec
    Blocks.Header({
      text: `${nodeEnv !== "production" && "[DEV] "}📬 Your Weekly Digest for ${formatDate(cutoff)}`,
    }),
    Blocks.Section({
      text: `You have ${Md.bold(`${recs.length}`)} recommendations this week!`,
    }),
    Blocks.Section({
      text: "Check out these rec'd paper for you from your network!",
    }),
    Blocks.Divider(),
    ...recSection.flat(),
    ...footer,
    Blocks.Section({
      text: `👀 Any interesting read this week? ${Md.link("https://recnet.io", "Share with your network!")}`,
    })
  );
  return {
    notificationText: `📬 Your RecNet weekly digest has arrived!`,
    messageBlocks,
  };
};
