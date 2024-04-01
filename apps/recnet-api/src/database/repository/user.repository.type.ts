import { Prisma } from "@prisma/client";

import { AuthProvider } from "@recnet/recnet-jwt";

import { UserRole } from "@recnet/recnet-api-model";

export const userPreview = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    handle: true,
    displayName: true,
    photoUrl: true,
    affiliation: true,
    bio: true,
    followedBy: true,
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
    followedBy: true,
    email: true,
    role: true,
    following: true,
  },
});

export type User = Prisma.UserGetPayload<typeof user>;

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
  email: string;
  role: UserRole;
  inviteCode: string;
};
