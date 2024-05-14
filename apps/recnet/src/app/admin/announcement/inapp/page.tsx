"use client";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { LoadingBox } from "@recnet/recnet-web/components/LoadingBox";
import { cn } from "@recnet/recnet-web/utils/cn";

import { AnnouncementForm } from "./AnnouncementForm";

import { AdminSectionBox, AdminSectionTitle } from "../../AdminSections";

export default function InappAnnouncement() {
  const {
    data: latestAnnouncement,
    isPending,
    isFetching,
  } = trpc.getLatestAnnouncement.useQuery();

  return (
    <div
      className={cn(
        "w-full",
        "sm:w-[90%]",
        "md:w-[70%]",
        "flex",
        "flex-col",
        "gap-y-4"
      )}
    >
      <div className="flex flex-col gap-y-2 w-full">
        {isPending || isFetching ? (
          <AdminSectionBox>
            <LoadingBox />
          </AdminSectionBox>
        ) : latestAnnouncement ? (
          <>
            <AdminSectionTitle description="Edit and preview the current announcement.">
              Current Announcement
            </AdminSectionTitle>
            <AnnouncementForm
              mode="update"
              prefilledData={latestAnnouncement}
            />
          </>
        ) : null}
        <AdminSectionTitle description="Publish new announcement. Will overwrite if already had activated announcement now.">
          Create new Announcement
        </AdminSectionTitle>
        <AnnouncementForm mode="create" />
        <AdminSectionTitle description="View all historical announcements">
          View all Announcements
        </AdminSectionTitle>
        <AdminSectionBox>
          <div>🚧 Coming Soon 🚧</div>
        </AdminSectionBox>
      </div>
    </div>
  );
}
