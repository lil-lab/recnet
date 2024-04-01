import { Prisma } from "@prisma/client";

import { userPreview } from "./user.repository.type";

export const inviteCode = Prisma.validator<Prisma.InviteCodeDefaultArgs>()({
  select: {
    id: true,
    code: true,
    owner: {
      select: userPreview.select,
    },
    issuedAt: true,
    usedBy: {
      select: userPreview.select,
    },
    usedAt: true,
  },
});
export type InviteCode = Prisma.InviteCodeGetPayload<typeof inviteCode>;

export type InviteCodeFilterBy = {
  used?: boolean;
};
