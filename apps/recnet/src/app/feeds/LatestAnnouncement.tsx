"use client";

import { AnnouncementCard } from "@recnet/recnet-web/components/AnnouncementCard";

import { trpc } from "../_trpc/client";

export function LatestAnnouncement() {
  const { data, isPending } = trpc.getLatestAnnouncement.useQuery();

  if (!data || isPending) {
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
