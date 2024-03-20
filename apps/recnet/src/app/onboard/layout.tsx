import { redirect } from "next/navigation";
import React from "react";

import { cn } from "@recnet/recnet-web/utils/cn";
import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";

export default async function OnboardPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getUserServerSide({
    isLoggedInCallback: () => {
      redirect("/feeds");
    },
    notLoggedInCallback: () => {
      redirect("/");
    },
  });
  return (
    <div
      className={cn(
        "w-full",
        "sm:w-[50%]",
        "md:w-[40%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "justify-center"
      )}
    >
      {children}
    </div>
  );
}
