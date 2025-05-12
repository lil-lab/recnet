import { Prisma } from "@prisma/client";

import { rec, Rec } from "./rec.repository.type";
import { userPreview } from "./user.repository.type";

export const reaction = Prisma.validator<Prisma.RecReactionDefaultArgs>()({
  select: {
    id: true,
    reaction: true,
    createdAt: true,
    recommendation: {
      select: rec.select,
    },
    user: {
      select: userPreview.select,
    },
  },
});
export type Reaction = Prisma.RecReactionGetPayload<typeof reaction>;

export type Activity = {
  type: "REC" | "REACTION";
  timestamp: Date;
  data: Rec | Reaction;
};

export type DateRange = {
  from?: Date;
  to?: Date;
};

export type ActivityFilterBy = {
  userId?: string;
  userIds?: string[];

  cutoff?: DateRange | Date;
};
