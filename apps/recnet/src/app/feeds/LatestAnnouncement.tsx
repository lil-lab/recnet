"use client";

import {
  AnnouncementCard,
  AnnouncementCardSkeleton,
} from "@recnet/recnet-web/components/AnnouncementCard";

import { trpc } from "../_trpc/client";

export function LatestAnnouncement() {
  const { data, isPending } = trpc.getLatestAnnouncement.useQuery();

  if (isPending) {
    return <AnnouncementCardSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <AnnouncementCard
      title={data.title}
      content={data.content}
      id={`${data.id}`}
      allowClose={data.allowClose}
    />
  );
}
