"use client";
import { Button } from "@radix-ui/themes";
import { useAuth } from "../AuthContext";
import { trpc } from "../_trpc/client";
import { Month } from "@recnet/recnet-web/constant";
import { getLatestCutOff } from "@recnet/recnet-date-fns";

export default function TestPage() {
  console.log(Month["APR"]);
  const { user, revalidateUser } = useAuth();
  const { data, isPending, error } = trpc.getUpcomingRec.useQuery();

  console.log({ data, error });

  return (
    <div>
      <Button
        onClick={async () => {
          if (!user) {
            console.error("You must be logged in to follow someone.");
            return;
          }
        }}
      >
        123
      </Button>
    </div>
  );
}
