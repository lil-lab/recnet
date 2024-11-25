import { Prisma } from "@prisma/client";

import { AuthProvider } from "@recnet/recnet-jwt";

export const userPreview = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    handle: true,
    displayName: true,
    photoUrl: true,
    affiliation: true,
    bio: true,
    url: true,
    followedBy: {
      where: {
        followedBy: { isActivated: true },
      },
    },
    recommendations: true,
  },
});

export type UserPreview = Prisma.UserGetPayload<typeof userPreview>;

export const user = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    handle: true,
    displayName: true,
    photoUrl: true,
    affiliation: true,
    bio: true,
    url: true,
    googleScholarLink: true,
    semanticScholarLink: true,
    openReviewUserName: true,
    followedBy: {
      where: {
        followedBy: { isActivated: true },
      },
    },
    email: true,
    role: true,
    isActivated: true,
    following: {
      where: {
        following: { isActivated: true },
      },
    },
    recommendations: true,
    subscriptions: true,
  },
});

export type User = Prisma.UserGetPayload<typeof user>;
export type Subscriptions = Prisma.UserGetPayload<typeof user>["subscriptions"];

export type UserFilterBy = {
  handle?: string;
  keyword?: string;
  id?: string;
};

export type CreateUserInput = {
  provider: AuthProvider;
  providerId: string;
  handle: string;
  displayName: string;
  photoUrl: string;
  affiliation: string | null;
  bio: string | null;
  url: string | null;
  googleScholarLink: string | null;
  semanticScholarLink: string | null;
  openReviewUserName: string | null;
  email: string;
  inviteCode: string;
};

export type UpdateUserInput = {
  handle?: string;
  displayName?: string;
  photoUrl?: string;
  affiliation?: string | null;
  bio?: string | null;
  url?: string | null;
  googleScholarLink?: string | null;
  semanticScholarLink?: string | null;
  openReviewUserName?: string | null;
  email?: string;
  isActivated?: boolean;
};
