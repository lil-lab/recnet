import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { cn } from "@recnet/recnet-web/utils/cn";

import { formatDate, getVerboseDateString } from "@recnet/recnet-date-fns";

import { AdminSectionBox, AdminSectionTitle } from "../../AdminSections";
import { AnnouncementForm } from "./AnnouncementForm";

export default async function InappAnnouncement() {
  const latestAnnouncement = await serverClient.getLatestAnnouncement();
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
        {latestAnnouncement ? (
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
