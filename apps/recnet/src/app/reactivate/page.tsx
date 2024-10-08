import { Text } from "@radix-ui/themes";
import { redirect } from "next/navigation";

import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { cn } from "@recnet/recnet-web/utils/cn";
import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";

import { ReactivateButton } from "./ReactivateButton";

export default async function ReactivatePage() {
  const user = await getUserServerSide({
    notRegisteredCallback: () => {
      redirect("/onboard");
    },
  });
  if (!user) {
    redirect("/");
  }
  // only deactivated users can access this page
  if (user.isActivated) {
    redirect("/feeds");
  }

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[60%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "justify-center",
        "items-center",
        "gap-y-6",
        "py-8",
        "px-4"
      )}
    >
      <Avatar user={user} size={"6"} />
      <Text size="4"> Welcome back, {user.displayName}!</Text>
      <Text size="3" className="w-[300px] text-center text-gray-11">
        Your account is currently deactivated. Reactivate your account to
        continue using Recnet.
      </Text>
      <ReactivateButton />
    </div>
  );
}
