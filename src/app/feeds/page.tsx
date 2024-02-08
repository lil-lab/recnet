import { getFeedsRecs } from "@/server/rec";
import { getCutOff, getLatestCutOff, START_DATE } from "@/utils/date";
import { getUserServerSide } from "@/utils/getUserServerSide";
import { notFound, redirect } from "next/navigation";
import { RecCard } from "@/components/RecCard";
import { Text } from "@radix-ui/themes";
import { cn } from "@/utils/cn";

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
  const user = await getUserServerSide();
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
      {recs.length > 0 ? (
        recs.map((rec, idx) => {
          return (
            <RecCard key={`${rec.title}-${rec.userId}-${idx}`} rec={rec} />
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
