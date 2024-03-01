import { db } from "@/firebase/admin";
import { StatBox, StatBoxSkeleton } from "@/app/admin/stats/StatBox";
import { Pencil1Icon, PersonIcon } from "@radix-ui/react-icons";
import { getDateFromFirebaseTimestamp, getLatestCutOff } from "@/utils/date";
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
    const cutOff = getLatestCutOff();
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
          console.error("Failed to parse rec", res.error);
          return null;
        }
      })
      .filter(notEmpty);
    const recsGroupByCycle = groupBy(filteredRecs, (doc) => {
      const date = getDateFromFirebaseTimestamp(doc.cutoff);
      return date.getTime();
    });
    const recCountByCycle = Object.keys(recsGroupByCycle).reduce(
      (acc, key) => ({
        ...acc,
        [key]: recsGroupByCycle[key].length,
      }),
      {}
    );

    return (
      <StatBox
        title="Number of Recs by Cutoff Date"
        icon={<Pencil1Icon />}
        className="h-[300px] w-[40%] min-w-[500px]"
      >
        <RecsCycleBarChart data={recCountByCycle} />
      </StatBox>
    );
  },
  <StatBoxSkeleton />
);

export default async function UserRecStats() {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-row gap-x-4">
        <CurrentUserCount />
        <RecCount />
        <RecsThisCycle />
      </div>
      <RecsBarChart />
    </div>
  );
}
