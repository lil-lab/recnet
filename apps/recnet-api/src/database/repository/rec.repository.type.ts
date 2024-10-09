import { Prisma } from "@prisma/client";

import { article } from "./article.repository.type";
import { userPreview } from "./user.repository.type";

export const rec = Prisma.validator<Prisma.RecommendationDefaultArgs>()({
  select: {
    id: true,
    description: true,
    isSelfRec: true,
    cutoff: true,
    user: {
      select: userPreview.select,
    },
    article: {
      select: article.select,
    },
  },
});
export type Rec = Prisma.RecommendationGetPayload<typeof rec>;

export const recReaction = Prisma.validator<Prisma.RecReactionDefaultArgs>()({
  select: {
    id: true,
    userId: true,
    recId: true,
    reaction: true,
  },
});
export type RecReaction = Prisma.RecReactionGetPayload<typeof recReaction>;

export type DateRange = {
  from?: Date;
  to?: Date;
};

export type RecFilterBy = {
  userId?: string;
  userIds?: string[];

  cutoff?: DateRange | Date;
};
