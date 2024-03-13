import { db } from "@recnet/recnet-web/firebase/admin";
import { UserSchema } from "@recnet/recnet-web/types/user";
import { formatDate, getLatestCutOff } from "@recnet/recnet-date-fns";
import { getRecsWithUsers } from "@recnet/recnet-web/server/rec";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";
import WeeklyDigest from "../../../../emails/WeeklyDigest";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@recnet/recnet-web/serverEnv";
import { Timestamp } from "firebase-admin/firestore";
import { RecSchema, RecWithUser } from "@recnet/recnet-web/types/rec";

// const TEST_USER_IDS = ["GoXnHBhgK8QhcZpki0la"];
const getRecKey = (recWithUser: RecWithUser) => {
  const titleLowercase = recWithUser.title.toLowerCase();
  const words = titleLowercase
    .split(" ")
    .filter((w) => w.length > 0)
    .filter(notEmpty);
  return words.join("");
};

interface Digest {
  to: string;
  message: {
    subject: string;
    html: string;
  };
}

export async function GET(request: NextRequest) {
  if (
    request.headers.get("Authorization") !== `Bearer ${serverEnv.CRON_SECRET}`
  ) {
    return NextResponse.json({ ok: false });
  }
  try {
    // init a map, Map<userId, Dictionary<RecWithUser>>
    // get all recs (RecWithUser) this cycle
    // for each rec, run for each user, if user is following the rec's user, add to the map

    const userDocs = await db.collection("users").get();
    const recsThisCycle = await db
      .collection("recommendations")
      .where("cutoff", "==", Timestamp.fromMillis(getLatestCutOff().getTime()))
      .get();
    // parse with RecSchema
    const recsThisCycleData = recsThisCycle.docs
      .map((doc) => {
        const res = RecSchema.safeParse({ ...doc.data(), id: doc.id });
        if (!res.success) {
          console.error("Error parsing rec", res.error);
          return null;
        }
        return res.data;
      })
      .filter(notEmpty);
    const recsWithUsersThisCycle = await getRecsWithUsers(recsThisCycleData);

    // init a map, Map<userId, Dictionary<RecWithUser>>
    const userRecsMap = new Map<string, Record<string, RecWithUser[]>>();
    recsWithUsersThisCycle.forEach((recWithUser) => {
      const key = getRecKey(recWithUser);
      userDocs.docs.forEach((userDoc) => {
        const userData = userDoc.data();
        const res = UserSchema.safeParse({
          ...userData,
          id: userDoc.id,
        });
        if (!res.success) {
          console.error("Error parsing user", res.error);
          return;
        }
        const user = res.data;
        if (user.following.includes(recWithUser.userId)) {
          if (!userRecsMap.has(user.email)) {
            userRecsMap.set(user.email, {});
          }
          const userRecs = userRecsMap.get(user.email);
          if (userRecs) {
            if (!userRecs[key]) {
              userRecs[key] = [];
            }
            userRecs[key].push(recWithUser);
          }
        }
      });
    });
    // for user not in the map, add empty recs
    userDocs.docs.forEach((userDoc) => {
      const userData = userDoc.data();
      const res = UserSchema.safeParse({
        ...userData,
        id: userDoc.id,
      });
      if (!res.success) {
        console.error("Error parsing user", res.error);
        return;
      }
      const user = res.data;
      if (!userRecsMap.has(user.email)) {
        userRecsMap.set(user.email, {});
      }
    });
    // prepare data for batch write
    const digests: Digest[] = [];
    userRecsMap.forEach((recsDict, email) => {
      const digest: Digest = {
        to: email,
        message: {
          subject: `[Recnet] Your Weekly Digest for ${formatDate(getLatestCutOff())}`,
          html: render(WeeklyDigest({ recsDict: recsDict })),
        },
      };
      digests.push(digest);
    });
    const batch = db.batch();
    digests.forEach((digest) => {
      const ref = db.collection("mails").doc();
      batch.set(ref, digest);
    });
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ ok: false });
  }
}
