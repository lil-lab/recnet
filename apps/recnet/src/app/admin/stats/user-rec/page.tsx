import { Pencil1Icon, PersonIcon } from "@radix-ui/react-icons";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import {
  StatBox,
  StatBoxSkeleton,
} from "@recnet/recnet-web/app/admin/stats/StatBox";
import { withSuspense } from "@recnet/recnet-web/components/hoc/withSuspense";

import { RecsCycleBarChart } from "./RecsCycleBarChart";

import { AdminSectionTitle } from "../../AdminSections";

const CurrentUserCount = withSuspense(
  async () => {
    const { num: numOfUsers } = await serverClient.getNumOfUsers();
    return (
      <StatBox title="Current Users" icon={<PersonIcon />}>
        {numOfUsers}
      </StatBox>
    );
  },
  <StatBoxSkeleton />
);

const RecCount = withSuspense(
  async () => {
    const { num: numberOfRecs } = await serverClient.getNumOfRecs();
    return (
      <StatBox title="Current Recs" icon={<Pencil1Icon />}>
        {numberOfRecs}
      </StatBox>
    );
  },
  <StatBoxSkeleton />
);

const RecsThisCycle = withSuspense(
  async () => {
    const { num: numOfUpcomingRecs } =
      await serverClient.getNumOfUpcomingRecs();
    return (
      <StatBox title="Recs This Cycle" icon={<Pencil1Icon />}>
        {numOfUpcomingRecs}
      </StatBox>
    );
  },
  <StatBoxSkeleton />
);

const RecsBarChart = withSuspense(
  async () => {
    const { recCountByCycle } = await serverClient.getRecCountByCycle();
    const minTs = Math.min(...Object.keys(recCountByCycle).map(Number));
    const maxTs = Math.max(...Object.keys(recCountByCycle).map(Number));
    // fill in missing dates
    for (let i = minTs; i <= maxTs; i += 604800000) {
      if (!recCountByCycle[i]) {
        recCountByCycle[i] = 0;
      }
    }

    return (
      <div className="flex flex-col md:flex-row gap-4">
        <StatBox
          title="Number of Recs by Cutoff Date"
          icon={<Pencil1Icon />}
          className="min-h-[300px] w-[100%] md:w-[85%] overflow-x-auto whitespace-nowrap"
        >
          <div className="min-w-[400px] h-full">
            <RecsCycleBarChart data={recCountByCycle} />
          </div>
        </StatBox>
      </div>
    );
  },
  <StatBoxSkeleton />
);

export default async function UserRecStats() {
  return (
    <div className="flex flex-col gap-y-4 w-full md:w-[70%]">
      <AdminSectionTitle>User & Recommendation Stats</AdminSectionTitle>
      <div className="flex flex-row gap-4 flex-wrap">
        <CurrentUserCount />
        <RecCount />
        <RecsThisCycle />
      </div>
      <RecsBarChart />
    </div>
  );
}
