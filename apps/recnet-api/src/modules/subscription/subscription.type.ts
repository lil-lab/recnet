import { Announcement } from "@recnet-api/modules/announcement/entities/announcement.entity";
import { Rec } from "@recnet-api/modules/rec/entities/rec.entity";

export type WeeklyDigestContent = {
  recs: Rec[];
  numUnusedInviteCodes: number;
  latestAnnouncement: Announcement | undefined;
};

export type SendResult = {
  success: boolean;
  skip?: boolean;
  userId?: string;
};
