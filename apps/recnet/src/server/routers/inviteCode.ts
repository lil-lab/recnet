import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import {
  checkFirebaseJWTProcedure,
  checkRecnetJWTProcedure,
  checkIsAdminProcedure,
} from "./middleware";
import { db } from "@recnet/recnet-web/firebase/admin";
import { TRPCError } from "@trpc/server";
import Chance from "chance";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";
import {
  UserPreview,
  userPreviewSchema,
  inviteCodeSchema,
} from "@recnet/recnet-api-model";
import { getDateFromFirebaseTimestamp } from "@recnet/recnet-date-fns";

function getNewInviteCode() {
  const chance = new Chance();
  const code = chance.string({
    length: 16,
    pool: "abcdefghijklmnopqrstuvwxyz0123456789",
  });
  // split the code into 4 parts
  return (code.match(/.{1,4}/g) as string[]).join("-");
}

export const inviteCodeRouter = router({
  getAllInviteCodes: checkIsAdminProcedure
    .output(
      z.object({
        inviteCodes: z.array(inviteCodeSchema),
      })
    )
    .query(async (opts) => {
      // get all invite codes
      const inviteCodes = await db.collection("invite-codes").get();
      // gather all userIds
      const userIds: string[] = [
        ...inviteCodes.docs
          .map((inviteCode) => inviteCode.data().usedBy)
          .filter(notEmpty),
        ...inviteCodes.docs
          .map((inviteCode) => inviteCode.data().issuedTo)
          .filter(notEmpty),
      ];
      // get all users data
      const users = await Promise.all(
        userIds.map(async (userId) => {
          const user = await db.collection("users").doc(userId).get();
          const userData = user.data();
          if (!userData) {
            return null;
          }
          // parse user data
          const res = userPreviewSchema.safeParse({
            id: user.id,
            handle: userData.username,
            displayName: userData.displayName,
            photoUrl: userData.photoURL,
            affiliation: userData.affiliation || null,
            bio: userData.bio || null,
            numFollowers: userData.followers.length,
          });
          if (res.success) {
            return res.data;
          }
          return null;
        })
      );
      const usersMap: Record<string, UserPreview> = users
        .filter(notEmpty)
        .reduce((acc, user) => {
          return {
            ...acc,
            [user.id]: user,
          };
        }, {});

      // join users to invite codes
      const inviteCodesWithUsers = inviteCodes.docs
        .map((inviteCode) => {
          const inviteCodeData = inviteCode.data();
          const usedBy = usersMap?.[inviteCodeData.usedBy] ?? null;
          const owner = usersMap[inviteCodeData.issuedTo];
          const res = inviteCodeSchema.safeParse({
            id: 0,
            code: inviteCodeData.id,
            owner: owner,
            issuedAt: inviteCodeData.issuedAt
              ? getDateFromFirebaseTimestamp(inviteCodeData.issuedAt)
              : null,
            usedBy: usedBy,
            usedAt: inviteCodeData.usedAt
              ? getDateFromFirebaseTimestamp(inviteCodeData.usedAt)
              : null,
          });
          if (res.success) {
            return res.data;
          }
          console.log(res.error);
          return null;
        })
        .filter(notEmpty);

      return {
        inviteCodes: inviteCodesWithUsers.sort((a, b) => {
          // sort by usedAt
          if (a.usedAt && b.usedAt) {
            return b.usedAt.getTime() - a.usedAt.getTime();
          }
          return (b.usedAt ? 1 : 0) - (a.usedAt ? 1 : 0);
        }),
      };
    }),
});
