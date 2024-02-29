import { db } from "@/firebase/admin";
import { StatBox, StatBoxSkeleton } from "@/app/admin/stats/StatBox";
import { Pencil1Icon, PersonIcon } from "@radix-ui/react-icons";
import { getLatestCutOff } from "@/utils/date";
import { Timestamp } from "firebase-admin/firestore";
import { withSuspense } from "@/utils/withSuspense";

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

export default async function UserRecStats() {
  return (
    <div className="">
      <div className="flex flex-row gap-x-4">
        <CurrentUserCount />
        <RecCount />
        <RecsThisCycle />
      </div>
    </div>
  );
}
