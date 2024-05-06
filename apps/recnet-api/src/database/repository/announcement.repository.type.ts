import { Prisma } from "@prisma/client";

import { userPreview } from "./user.repository.type";

export const announcement = Prisma.validator<Prisma.AnnouncementDefaultArgs>()({
  select: {
    id: true,
    title: true,
    content: true,
    startAt: true,
    endAt: true,
    isActivated: true,
    allowClose: true,
    createdBy: { select: userPreview.select },
  },
});

export type Announcement = Prisma.AnnouncementGetPayload<typeof announcement>;

export type CreateAnnouncementInput = {
  title: string;
  content: string;
  startAt: Date;
  endAt: Date;
  isActivated: boolean;
  allowClose: boolean;
  createdById: string;
};

export type UpdateAnnouncementInput = {
  title?: string;
  content?: string;
  startAt?: Date;
  endAt?: Date;
  isActivated?: boolean;
  allowClose?: boolean;
};

export type AnnouncementFilterBy = {
  activatedOnly?: boolean;
  currentOnly?: boolean;
};
