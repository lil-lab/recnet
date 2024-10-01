import { Prisma } from "@prisma/client";

export const digitalLibrary =
  Prisma.validator<Prisma.DigitalLibraryDefaultArgs>()({
    select: {
      id: true,
      name: true,
      regex: true,
      isVerified: true,
      rank: true,
    },
  });
export type DigitalLibrary = Prisma.DigitalLibraryGetPayload<
  typeof digitalLibrary
>;

export type DigitalLibraryFilterBy = {
  id?: number;
  name?: string;
};
