import { WeeklyDigestContent } from "@recnet-api/modules/subscription/subscription.type";

import { formatDate } from "@recnet/recnet-date-fns";

export const weeklyDigestSlackTemplate = (
  cutoff: Date,
  content: WeeklyDigestContent,
  nodeEnv: string
): string => {
  const subject = `${nodeEnv !== "production" && "[DEV] "}📬 Your Weekly Digest for ${formatDate(cutoff)}`;
  const unusedInviteCodes = `You have ${content.numUnusedInviteCodes} unused invite codes! Share the love ❤️`;
  const latestAnnouncement = content.latestAnnouncement
    ? `📢 ${content.latestAnnouncement.title} \n ${content.latestAnnouncement.content}`
    : "";
  const recsUrls = content.recs.map(
    (rec) => `[${rec.article.title}](https://recnet.io/rec/${rec.id})`
  );
  return `${subject}\nYou have ${content.recs.length} recommendations this week!\nCheck out these rec'd paper for you from your network!\n${unusedInviteCodes}\n${latestAnnouncement}\n${recsUrls.join("\n")} \n\nAny interesting read this week? 👀\nShare with your network: https://recnet.io/`;
};
