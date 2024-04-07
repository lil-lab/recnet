import { TRPCError } from "@trpc/server";
import Chance from "chance";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { ErrorMessages } from "@recnet/recnet-web/constant";
import { db } from "@recnet/recnet-web/firebase/admin";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";

import { getDateFromFirebaseTimestamp } from "@recnet/recnet-date-fns";

import {
  UserPreview,
  userPreviewSchema,
  inviteCodeSchema,
  postInviteCodesRequestSchema,
  postInviteCodesResponseSchema,
  getUsersParamsSchema,
} from "@recnet/recnet-api-model";

import { checkIsAdminProcedure } from "./middleware";

import { router } from "../trpc";

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
            // In the new schema, id is a auto-incremented number
            // 0 is just a placeholder now since current firebase db don't have numeric ID.
            id: 0,
            code: inviteCodeData.id,
            owner: owner,
            issuedAt: inviteCodeData.issuedAt
              ? getDateFromFirebaseTimestamp(
                  inviteCodeData.issuedAt
                ).toISOString()
              : new Date().toISOString(),
            usedBy: usedBy,
            usedAt: inviteCodeData.usedAt
              ? getDateFromFirebaseTimestamp(
                  inviteCodeData.usedAt
                ).toISOString()
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
            return new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime();
          }
          return (b.usedAt ? 1 : 0) - (a.usedAt ? 1 : 0);
        }),
      };
    }),
  generateInviteCode: checkIsAdminProcedure
    .input(
      postInviteCodesRequestSchema.omit({ ownerId: true }).extend({
        ownerHandle: z.string(),
      })
    )
    .output(postInviteCodesResponseSchema)
    .mutation(async (opts) => {
      const { ownerHandle, numCodes } = opts.input;
      const { recnetApi } = opts.ctx;
      // check if owner exists
      const { data: ownerData } = await recnetApi.get("/users", {
        params: {
          ...getUsersParamsSchema.parse({
            handle: ownerHandle,
            page: 1,
            pageSize: 1,
          }),
        },
      });
      const userParseRes = userPreviewSchema.safeParse(ownerData.users[0]);
      if (!userParseRes.success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ErrorMessages.USER_NOT_FOUND,
        });
      }
      const ownerId = userParseRes.data.id;
      const { data } = await recnetApi.post("invite-codes", {
        ...postInviteCodesRequestSchema.parse({
          ownerId,
          numCodes,
        }),
      });
      return postInviteCodesResponseSchema.parse(data);
    }),
});
