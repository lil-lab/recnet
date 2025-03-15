import { Prisma } from "@prisma/client";

import { rec, Rec } from "./rec.repository.type";

export const reaction = Prisma.validator<Prisma.RecReactionDefaultArgs>()({
  select: {
    id: true,
    userId: true,
    reaction: true,
    createdAt: true,
    recommendation: {
      select: rec.select,
    },
  },
});
export type Reaction = Prisma.RecReactionGetPayload<typeof reaction>;

export type Activity = {
  type: "rec" | "reaction";
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

export type ReactionFilterBy = {
  userId?: string;
  userIds?: string[];

  cutoff?: DateRange | Date;
};
