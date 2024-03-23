import { Prisma } from "@prisma/client";

export const rec = Prisma.validator<Prisma.RecommendationDefaultArgs>()({
  select: {
    id: true,
    description: true,
    cutoff: true,
    user: {
      select: {
        id: true,
        handle: true,
        displayName: true,
        photoUrl: true,
        affiliation: true,
        bio: true,
        followedBy: true,
      },
    },
    article: {
      select: {
        id: true,
        title: true,
        doi: true,
        author: true,
        link: true,
        year: true,
        month: true,
        isVerified: true,
      },
    },
  },
});

export type Rec = Prisma.RecommendationGetPayload<typeof rec>;
