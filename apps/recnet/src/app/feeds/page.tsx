import { getFeedsRecs, getRecsWithUsers } from "@recnet/recnet-web/server/rec";
import {
  getCutOff,
  getLatestCutOff,
  START_DATE,
} from "@recnet/recnet-web/utils/date";
import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";
import { notFound, redirect } from "next/navigation";
import { RecCard } from "@recnet/recnet-web/components/RecCard";
import { Text } from "@radix-ui/themes";
import { cn } from "@recnet/recnet-web/utils/cn";
import groupBy from "lodash.groupby";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";

function verifyDate(date: string) {
  const parsedDate = new Date(date);
  if (parsedDate.toString() === "Invalid Date") {
    notFound();
  }
  // if it's earlier than the earliest date we support, redirect to notFound
  if (parsedDate.getTime() < START_DATE.getTime()) {
    console.log(
      "date is earlier than START_DATE",
      date,
      START_DATE.toISOString()
    );
    notFound();
  }
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: {
    date?: string;
  };
}) {
  const user = await getUserServerSide({
    notRegisteredCallback: () => {
      redirect("/onboard");
    },
  });
  if (!user) {
    // if not logged in, redirect to home
    redirect("/");
  }
  const date = searchParams["date"];
  // verify that date is a valid date
  if (date) {
    verifyDate(date);
  }
  const cutoff = date ? getCutOff(new Date(date)) : getLatestCutOff();
  const recs = await getFeedsRecs(user?.id, cutoff.getTime());
  const recsWithUsers = await getRecsWithUsers(recs);
  const recsGroupByTitle = groupBy(recsWithUsers, (recWithUser) => {
    const titleLowercase = recWithUser.title.toLowerCase();
    const words = titleLowercase
      .split(" ")
      .filter((w) => w.length > 0)
      .filter(notEmpty);
    return words.join("");
  });

  return (
    <div
      className={cn(
        "w-[80%]",
        "md:w-[65%]",
        "flex",
        "flex-col",
        "gap-y-4",
        "mx-auto",
        "py-4",
        "md:py-12"
      )}
    >
      {Object.keys(recsGroupByTitle).length > 0 ? (
        Object.keys(recsGroupByTitle).map((recTitle, idx) => {
          const recsWithUsers = recsGroupByTitle[recTitle];
          return (
            <RecCard key={`${recTitle}-${idx}`} recsWithUsers={recsWithUsers} />
          );
        })
      ) : (
        <div className="h-[150px] w-full flex justify-center items-center">
          <Text size="3" className="text-gray-10">
            No recommendations from your network this week.
          </Text>
        </div>
      )}
    </div>
  );
}
