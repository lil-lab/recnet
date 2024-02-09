import React from "react";
import { getUserServerSide } from "@/utils/getUserServerSide";
import { redirect } from "next/navigation";
import { cn } from "@/utils/cn";

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
