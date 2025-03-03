import { Prisma } from "@prisma/client";

export const reaction = Prisma.validator<Prisma.RecReactionDefaultArgs>()({
  select: {
    id: true,
    userId: true,
    recId: true,
    reaction: true,
    createdAt: true,
  },
});
export type Reaction = Prisma.RecReactionGetPayload<typeof reaction>;

export type DateRange = {
  from?: Date;
  to?: Date;
};

export type ReactionFilterBy = {
  userId?: string;
  userIds?: string[];

  cutoff?: DateRange | Date;
};
