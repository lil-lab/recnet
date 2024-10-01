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

export type CreateDigitalLibraryInput = {
  name: string;
  regex: Array<string>;
  isVerified: boolean;
  rank: number;
};

export type UpdateDigitalLibraryInput = {
  name?: string;
  regex?: Array<string>;
  isVerified?: boolean;
};

export type UpdateDigitalLibrariesRankInput = Array<{
  id: number;
  rank: number;
}>;
