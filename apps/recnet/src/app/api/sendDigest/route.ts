import { db } from "@/firebase/admin";
import { UserSchema } from "@/types/user";
import { formatDate, getLatestCutOff } from "@/utils/date";
import { getFeedsRecs, getRecsWithUsers } from "@/server/rec";
import groupBy from "lodash.groupby";
import { notEmpty } from "@/utils/notEmpty";
import WeeklyDigest from "../../../../emails/WeeklyDigest";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";

const TEST_USER_IDS = ["GoXnHBhgK8QhcZpki0la"];

export async function GET(request: NextRequest) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ ok: false });
  }
  try {
    // map over users
    // for each user, get the feeds this cycle
    // and get recsWithUsers, and groupBy title
    // push an email to collection "mails"

    const userDocs = await db.collection("users").get();
    await Promise.all(
      userDocs.docs.map(async (userDoc) => {
        const userData = userDoc.data();

        // parse with UserSchema
        const res = UserSchema.safeParse({
          ...userData,
          id: userDoc.id,
        });
        if (!res.success) {
          console.error("Error parsing user", res.error);
          return;
        }
        const user = res.data;

        // test within certain user ids
        if (!TEST_USER_IDS.includes(user.id)) {
          return;
        }

        const recs = await getFeedsRecs(user?.id, getLatestCutOff().getTime());
        const recsWithUsers = await getRecsWithUsers(recs);
        const recsGroupByTitle = groupBy(recsWithUsers, (recWithUser) => {
          const titleLowercase = recWithUser.title.toLowerCase();
          const words = titleLowercase
            .split(" ")
            .filter((w) => w.length > 0)
            .filter(notEmpty);
          return words.join("");
        });

        const digest = {
          to: user.email,
          message: {
            subject: `[Recnet] Your Weekly Digest for ${formatDate(getLatestCutOff())}`,
            html: render(WeeklyDigest({ recsDict: recsGroupByTitle })),
          },
        };

        await db.collection("mails").add(digest);
      })
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ ok: false });
  }
}