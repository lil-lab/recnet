import { TRPCError } from "@trpc/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { UserRole } from "@recnet/recnet-web/constant";
import { ErrorMessages } from "@recnet/recnet-web/constant";
import { db } from "@recnet/recnet-web/firebase/admin";

import {
  getUserMeResponseSchema,
  getUserLoginResponseSchema,
  userPreviewSchema,
  userSchema,
  postUserFollowRequestSchema,
  deleteUserFollowParamsSchema,
  postUserValidateInviteCodeRequestSchema,
  postUserValidateHandleRequestSchema,
  getUsersParamsSchema,
  patchUserMeRequestSchema,
  patchUserMeResponseSchema,
} from "@recnet/recnet-api-model";

import {
  checkFirebaseJWTProcedure,
  checkIsAdminProcedure,
  checkRecnetJWTProcedure,
  getUserByTokens,
} from "./middleware";

import { publicProcedure, router } from "../trpc";

export const userRouter = router({
  getMe: publicProcedure
    .output(z.union([getUserMeResponseSchema, z.object({ user: z.null() })]))
    .query(async (opts) => {
      const { tokens, recnetApi } = opts.ctx;
      if (!tokens) {
        return {
          user: null,
        };
      }
      const user = await getUserByTokens(tokens, recnetApi);
      return {
        user,
      };
    }),
  getUserByHandle: publicProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .output(
      z.object({
        user: userPreviewSchema.nullable(),
      })
    )
    .query(async (opts) => {
      const { handle } = opts.input;
      const { recnetApi } = opts.ctx;
      try {
        const { data } = await recnetApi.get("/users", {
          params: {
            ...getUsersParamsSchema.parse({
              handle: handle,
              page: 1,
              pageSize: 1,
            }),
          },
        });
        return {
          user: userPreviewSchema.parse(data.users[0]),
        };
      } catch (e) {
        return {
          user: null,
        };
      }
    }),
  login: checkFirebaseJWTProcedure
    .output(getUserLoginResponseSchema)
    .mutation(async (opts) => {
      const { tokens, recnetApi } = opts.ctx;
      try {
        const { data } = await recnetApi.get("/users/login", {
          headers: {
            Authorization: `Bearer ${tokens.token}`,
          },
        });
        return getUserLoginResponseSchema.parse(data);
      } catch (e) {
        // TODO: use if else statement to catch the correct error
        // handle user first login and throw this error to redirect to the signup page
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ErrorMessages.USER_NOT_FOUND,
        });
      }
    }),
  follow: checkRecnetJWTProcedure
    .input(postUserFollowRequestSchema)
    .mutation(async (opts) => {
      const { userId } = opts.input;
      const { recnetApi } = opts.ctx;
      await recnetApi.post("/users/follow", {
        userId,
      });
    }),
  unfollow: checkRecnetJWTProcedure
    .input(deleteUserFollowParamsSchema)
    .mutation(async (opts) => {
      const { userId } = opts.input;
      const { recnetApi } = opts.ctx;
      await recnetApi.delete("/users/follow", {
        params: {
          userId,
        },
      });
    }),
  checkUserHandleValid: checkFirebaseJWTProcedure
    .input(postUserValidateHandleRequestSchema)
    .output(
      z.object({
        isValid: z.boolean(),
      })
    )
    .mutation(async (opts) => {
      const { handle } = opts.input;
      const { recnetApi } = opts.ctx;
      try {
        await recnetApi.post("/users/validate/handle", {
          handle,
        });
        return {
          isValid: true,
        };
      } catch (e) {
        return {
          isValid: false,
        };
      }
    }),
  checkInviteCodeValid: checkFirebaseJWTProcedure
    .input(postUserValidateInviteCodeRequestSchema)
    .output(
      z.object({
        isValid: z.boolean(),
      })
    )
    .mutation(async (opts) => {
      const { inviteCode } = opts.input;
      const { recnetApi } = opts.ctx;
      try {
        await recnetApi.post("/users/validate/invite-code", {
          inviteCode,
        });
        return {
          isValid: true,
        };
      } catch (e) {
        return {
          isValid: false,
        };
      }
    }),
  createUser: checkFirebaseJWTProcedure
    .input(
      // REFACTOR_AFTER_MIGRATION: change the interface of this function,
      // don't need firebaseUser after migration, and we need some additional info about user
      // see recnet-api-model/src/lib/api/user.ts to see the new interface
      z.object({
        userInfo: z.object({
          inviteCode: z.string(),
          handle: z.string(),
          affiliation: z.string().nullable(),
        }),
        firebaseUser: z.any(),
      })
    )
    .output(
      z.object({
        user: userSchema,
      })
    )
    .mutation(async (opts) => {
      const { userInfo, firebaseUser } = opts.input;
      const { inviteCode, handle, affiliation } = userInfo;
      const codeRef = db.doc(`invite-codes/${inviteCode}`);
      const codeDoc = await codeRef.get();
      if (!codeDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ErrorMessages.INVITE_CODE_NOT_FOUND,
        });
      }
      if (codeDoc.data()?.used) {
        throw new TRPCError({
          code: "CONFLICT",
          message: ErrorMessages.INVITE_CODE_USED,
        });
      }
      if (!firebaseUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: ErrorMessages.USER_NOT_FOUND,
        });
      }
      // create user
      const userData = {
        ...firebaseUser,
        createdAt: FieldValue.serverTimestamp(),
        followers: [],
        following: [],
        inviteCode: inviteCode,
        username: handle,
        affiliation: affiliation,
      };
      const { id: userId } = await db.collection("users").add(userData);
      const userRef = db.doc(`users/${userId}`);
      const additionalInfo = { seed: userId, id: userId };
      await userRef.set(additionalInfo, { merge: true });
      // mark invite code as used
      await codeRef.set(
        { used: true, usedAt: FieldValue.serverTimestamp(), usedBy: userId },
        { merge: true }
      );
      return {
        user: userSchema.parse({
          id: userId,
          handle: handle,
          displayName: firebaseUser.displayName,
          photoUrl: firebaseUser.photoURL,
          affiliation: affiliation,
          bio: null,
          numFollowers: 0,
          email: firebaseUser.email,
          role: UserRole.USER,
          following: [], // temperory set to empty since it's unused and will be removed after migration
        }),
      };
    }),
  updateUser: checkRecnetJWTProcedure
    .input(patchUserMeRequestSchema)
    .output(patchUserMeResponseSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.patch("/users/me", {
        ...opts.input,
      });
      return patchUserMeResponseSchema.parse(data);
    }),
  getNumOfUsers: checkIsAdminProcedure
    .output(z.object({ num: z.number() }))
    .query(async () => {
      const users = await db.collection("users").get();
      return {
        num: users.size,
      };
    }),
});
