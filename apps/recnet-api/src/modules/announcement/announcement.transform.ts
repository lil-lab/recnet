import { Announcement as DbAnnouncement } from "@recnet-api/database/repository/announcement.repository.type";
import { transformUserPreview } from "@recnet-api/modules/user/user.transformer";

import { Announcement } from "./entities/announcement.entity";

export const transformAnnouncement = (
  dbAnnouncement: DbAnnouncement
): Announcement => {
  const { createdBy } = dbAnnouncement;
  const createdByUserPreview = transformUserPreview(createdBy);
  return {
    id: dbAnnouncement.id,
    title: dbAnnouncement.title,
    content: dbAnnouncement.content,
    startAt: dbAnnouncement.startAt,
    endAt: dbAnnouncement.endAt,
    isActivated: dbAnnouncement.isActivated,
    allowClose: dbAnnouncement.allowClose,
    createdBy: createdByUserPreview,
  };
};
