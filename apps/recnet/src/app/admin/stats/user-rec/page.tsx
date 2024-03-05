import { db } from "@/firebase/admin";
import { StatBox, StatBoxSkeleton } from "@/app/admin/stats/StatBox";
import { Pencil1Icon, PersonIcon } from "@radix-ui/react-icons";
import { getDateFromFirebaseTimestamp, getNextCutOff } from "@/utils/date";
import { Timestamp } from "firebase-admin/firestore";
import { withSuspense } from "@/utils/withSuspense";
import groupBy from "lodash.groupby";
import { RecSchema } from "@/types/rec";
import { notEmpty } from "@/utils/notEmpty";
import { RecsCycleBarChart } from "./RecsCycleBarChart";

const CurrentUserCount = withSuspense(
  async () => {
    const users = await db.collection("users").get();
    const userCount = users.size;
    return (
      <StatBox title="Current Users" icon={<PersonIcon />}>
        {userCount}
      </StatBox>
    );
  },
  <StatBoxSkeleton />
);

const RecCount = withSuspense(
  async () => {
    const recs = await db.collection("recommendations").get();
    const recCount = recs.size;
    return (
      <StatBox title="Current Recs" icon={<Pencil1Icon />}>
        {recCount}
      </StatBox>
    );
  },
  <StatBoxSkeleton />
);

const RecsThisCycle = withSuspense(
  async () => {
    const cutOff = getNextCutOff();
    console.log("cutOff", cutOff);
    const recsThisCycle = await db
      .collection("recommendations")
      .where("cutoff", "==", Timestamp.fromMillis(cutOff.getTime()))
      .get();
    return (
      <StatBox title="Recs This Cycle" icon={<Pencil1Icon />}>
        {recsThisCycle.size}
      </StatBox>
    );
  },
  <StatBoxSkeleton />
);

const RecsBarChart = withSuspense(
  async () => {
    const recs = await db.collection("recommendations").get();
    const filteredRecs = recs.docs
      .map((doc) => {
        const data = doc.data();
        // parse by rec schema
        const res = RecSchema.safeParse({ ...data, id: doc.id });
        if (res.success) {
          return res.data;
        } else {
          // console.error("Failed to parse rec", res.error);
          return null;
        }
      })
      .filter(notEmpty);
    const recsGroupByCycle = groupBy(filteredRecs, (doc) => {
      const date = getDateFromFirebaseTimestamp(doc.cutoff);
      return date.getTime();
    });
    const recCountByCycle: Record<string, number> = Object.keys(
      recsGroupByCycle
    ).reduce(
      (acc, key) => ({
        ...acc,
        [key]: recsGroupByCycle[key].length,
      }),
      {}
    );
    const minTs = Math.min(...Object.keys(recCountByCycle).map(Number));
    const maxTs = Math.max(...Object.keys(recCountByCycle).map(Number));
    // fill in missing dates, increment by 1 week
    for (let i = minTs; i <= maxTs; i += 604800000) {
      if (!recCountByCycle[i]) {
        recCountByCycle[i] = 0;
      }
    }

    return (
      <StatBox
        title="Number of Recs by Cutoff Date"
        icon={<Pencil1Icon />}
        className="h-[300px] w-[100%] md:w-[55%] overflow-x-auto whitespace-nowrap overflow-y-hidden"
      >
        <div className="min-w-[400px] h-full">
          <RecsCycleBarChart data={recCountByCycle} />
        </div>
      </StatBox>
    );
  },
  <StatBoxSkeleton />
);

export default async function UserRecStats() {
  return (
    <div className="flex flex-col gap-y-4 w-full md:w-[70%]">
      <div className="flex flex-row gap-4 flex-wrap">
        <CurrentUserCount />
        <RecCount />
        <RecsThisCycle />
      </div>
      <RecsBarChart />
    </div>
  );
}
