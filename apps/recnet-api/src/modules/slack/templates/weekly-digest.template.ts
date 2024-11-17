import { BlockCollection, Md, Blocks, BlockBuilder } from "slack-block-builder";

import { WeeklyDigestContent } from "@recnet-api/modules/subscription/subscription.type";

import { formatDate } from "@recnet/recnet-date-fns";

import type { SlackMessageBlocks } from "../slack.type";

// export const weeklyDigestSlackTemplate = (
//   cutoff: Date,
//   content: WeeklyDigestContent,
//   nodeEnv: string
// ): string => {
//   const subject = `${nodeEnv !== "production" && "[DEV] "}📬 Your Weekly Digest for ${formatDate(cutoff)}`;
//   const unusedInviteCodes = `You have ${content.numUnusedInviteCodes} unused invite codes! Share the love ❤️`;
//   const latestAnnouncement = content.latestAnnouncement
//     ? `📢 ${content.latestAnnouncement.title} \n ${content.latestAnnouncement.content}`
//     : "";
//   const recsUrls = content.recs.map(
//     (rec) => `[${rec.article.title}](https://recnet.io/rec/${rec.id})`
//   );
//   return `${subject}\nYou have ${content.recs.length} recommendations this week!\nCheck out these rec'd paper for you from your network!\n${unusedInviteCodes}\n${latestAnnouncement}\n${recsUrls.join("\n")} \n\nAny interesting read this week? 👀\nShare with your network: https://recnet.io/`;
// };

export const weeklyDigestSlackTemplate = (
  cutoff: Date,
  content: WeeklyDigestContent,
  nodeEnv: string
): SlackMessageBlocks => {
  const { recs, numUnusedInviteCodes, latestAnnouncement } = content;

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

  return BlockCollection(
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
    // recs
    Blocks.Section({
      text: "recs placeholder",
    }),
    Blocks.Divider(),
    // others: num of unused invite codes, latest announcement
    ...footer,
    // footer: share with your network
    Blocks.Section({
      text: `👀 Any interesting read this week? ${Md.link("https://recnet.io", "Share with your network!")}`,
    })
  );
};
