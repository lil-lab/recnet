import { WeeklyDigestContent } from "@recnet-api/modules/subscription/subscription.type";

import { formatDate } from "@recnet/recnet-date-fns";

export const weeklyDigestSlackTemplate = (
  cutoff: Date,
  content: WeeklyDigestContent,
  nodeEnv: string
) => {
  const subject = `${nodeEnv !== "production" && "[DEV] "}📬 Your Weekly Digest for ${formatDate(cutoff)}`;
  const unusedInviteCodes = `You have ${content.numUnusedInviteCodes} unused invite codes! Share the love ❤️ \n    -----`;
  const latestAnnouncement = content.latestAnnouncement
    ? `📢 ${content.latestAnnouncement.title} \n ${content.latestAnnouncement.content}\n    -----`
    : "";
  const recsUrls = content.recs.map((rec) => `https://recnet.io/rec/${rec.id}`);
  return `
    ${subject}
    You have ${content.recs.length} recommendations this week!

    Check out these rec'd paper for you from your network!
    -----
    ${unusedInviteCodes}
    ${latestAnnouncement}
    ${recsUrls.join("\n")}
    -----
    Any interesting read this week? 👀
    Share with your network: https://recnet.io/
    `;
};
