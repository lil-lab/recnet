import type { Metadata } from "next";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { cn } from "@recnet/recnet-web/utils/cn";

import { RecPageContent } from "./RecPageContent";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const id = params.id;

  const { rec } = await serverClient.getRecById({
    id,
  });

  return {
    title: rec.article.title,
    description: `${rec.user.displayName} recommends: ${rec.description}`,
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[35%]",
        "sm:w-[60%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6",
        "mt-10"
      )}
    >
      <GoBackButton />
      <RecPageContent id={id} />
    </div>
  );
}
