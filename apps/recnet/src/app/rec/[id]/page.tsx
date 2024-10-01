import type { Metadata, ResolvingMetadata } from "next";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { cn } from "@recnet/recnet-web/utils/cn";

import { RecPageContent } from "./RecPageContent";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const id = params.id;

  // fetch data
  const { rec } = await serverClient.getRecById({
    id,
  });

  return {
    title: rec.article.title,
    description: rec.description,
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
