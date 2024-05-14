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
      select: {
        followedBy: true,
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
      select: {
        followedBy: true,
      },
    },
    email: true,
    role: true,
    isActivated: true,
    following: {
      select: {
        followingId: true,
        following: true,
      },
    },
    recommendations: true,
  },
});

export type User = Prisma.UserGetPayload<typeof user>;

export type UserFilterBy = {
  isActivated?: boolean;
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
};
