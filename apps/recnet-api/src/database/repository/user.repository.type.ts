import { Prisma } from "@prisma/client";

const userPreviews = Prisma.validator<Prisma.UserDefaultArgs>()({
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

export type UserPreview = Prisma.UserGetPayload<typeof userPreviews>;

const user = Prisma.validator<Prisma.UserDefaultArgs>()({
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
