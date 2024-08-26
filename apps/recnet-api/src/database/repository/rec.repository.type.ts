import { Prisma } from "@prisma/client";

import { article } from "./article.repository.type";
import { userPreview } from "./user.repository.type";

export const rec = Prisma.validator<Prisma.RecommendationDefaultArgs>()({
  select: {
    id: true,
    description: true,
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

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

export type RecFilterBy = {
  userId?: string;
  userIds?: string[];

  cutoff?: DateRange | Date;
};
