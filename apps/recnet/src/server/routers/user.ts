import { TRPCError } from "@trpc/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { UserRole } from "@recnet/recnet-web/constant";
import { ErrorMessages } from "@recnet/recnet-web/constant";
import { db } from "@recnet/recnet-web/firebase/admin";

import { userPreviewSchema, userSchema } from "@recnet/recnet-api-model";

import {
  checkFirebaseJWTProcedure,
  checkIsAdminProcedure,
  checkRecnetJWTProcedure,
  getUserByTokens,
} from "./middleware";

import { publicProcedure, router } from "../trpc";

export const userRouter = router({
  login: checkFirebaseJWTProcedure
    .output(
      z.object({
        user: userSchema,
      })
    )
    .mutation(async (opts) => {
      // REFACTOR_AFTER_MIGRATION: use /users/login POST to get user and set custom claims
      const { tokens } = opts.ctx;
      const { decodedToken } = tokens;
      const email = decodedToken.email;
      const querySnapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ErrorMessages.USER_NOT_FOUND,
        });
      }
      const user = userSchema.parse({
        id: querySnapshot.docs[0].id,
        handle: querySnapshot.docs[0].data().username,
        displayName: querySnapshot.docs[0].data().displayName,
        photoUrl: querySnapshot.docs[0].data().photoURL,
        affiliation: querySnapshot.docs[0].data().affiliation || null,
        bio: querySnapshot.docs[0].data().bio || null,
        numFollowers: querySnapshot.docs[0].data().followers.length,
        email: querySnapshot.docs[0].data().email,
        role: querySnapshot.docs[0].data().role
          ? UserRole.ADMIN
          : UserRole.USER,
        following: [], // temperory set to empty since it's unused and will be removed after migration
      });
      return {
        user,
      };
    }),
  follow: checkRecnetJWTProcedure
    .input(
      z.object({
        targetUserId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { id: userId } = opts.ctx.user;
      const { targetUserId } = opts.input;
      // add to [id] user followers
      await db.doc(`users/${targetUserId}`).update({
        followers: FieldValue.arrayUnion(userId),
      });

      // add to current user following
      await db.doc(`users/${userId}`).update({
        following: FieldValue.arrayUnion(targetUserId),
      });
    }),
  unfollow: checkRecnetJWTProcedure
    .input(
      z.object({
        targetUserId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { id: userId } = opts.ctx.user;
      const { targetUserId } = opts.input;
      // remove from [id] user followers
      await db.doc(`users/${targetUserId}`).update({
        followers: FieldValue.arrayRemove(userId),
      });
      // remove from current user following
      await db.doc(`users/${userId}`).update({
        following: FieldValue.arrayRemove(targetUserId),
      });
    }),
  checkUserHandleValid: checkFirebaseJWTProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .output(
      z.object({
        isValid: z.boolean(),
      })
    )
    .mutation(async (opts) => {
      const { handle } = opts.input;
      const querySnapshot = await db
        .collection("users")
        .where("username", "==", handle)
        .limit(1)
        .get();
      return {
        isValid: querySnapshot.empty,
      };
    }),
  checkInviteCodeValid: checkFirebaseJWTProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .output(
      z.object({
        isValid: z.boolean(),
      })
    )
    .mutation(async (opts) => {
      const { code } = opts.input;
      const ref = db.doc(`invite-codes/${code}`);
      const docSnap = await ref.get();
      if (docSnap.exists) {
        return {
          isValid: docSnap.data()?.used === false,
        };
      }
      return {
        isValid: false,
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
      const querySnapshot = await db
        .collection("users")
        .where("username", "==", handle)
        .limit(1)
        .get();
      if (querySnapshot.empty) {
        return {
          user: null,
        };
      }
      const userParsedRes = userPreviewSchema.safeParse({
        id: querySnapshot.docs[0].id,
        handle: querySnapshot.docs[0].data().username,
        displayName: querySnapshot.docs[0].data().displayName,
        photoUrl: querySnapshot.docs[0].data().photoURL,
        affiliation: querySnapshot.docs[0].data().affiliation || null,
        bio: querySnapshot.docs[0].data().bio || null,
        numFollowers: querySnapshot.docs[0].data().followers.length,
      });
      if (userParsedRes.success) {
        return {
          user: userParsedRes.data,
        };
      }
      return {
        user: null,
      };
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
    .input(
      z.object({
        newData: userSchema.partial(),
      })
    )
    .output(
      z.object({
        user: userSchema,
      })
    )
    .mutation(async (opts) => {
      const { newData } = opts.input;
      const userId = opts.ctx.tokens.decodedToken.recnet.userId;
      const { handle, displayName, affiliation } = newData;
      const docRef = db.doc(`users/${userId}`);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ErrorMessages.USER_NOT_FOUND,
        });
      }

      if (handle != docSnap?.data?.()?.username) {
        if (handle) {
          // check if username is unique
          const snapshot = await db
            .collection("users")
            .where("username", "==", handle)
            .get();
          if (!snapshot.empty) {
            throw new TRPCError({
              code: "CONFLICT",
              message: ErrorMessages.USER_HANDLE_USED,
            });
          }
        }
      }

      const data = {
        username: handle,
        displayName: displayName,
        affiliation: affiliation,
      };
      await docRef.set(data, { merge: true });
      return {
        user: userSchema.parse({
          id: userId,
          handle: handle,
          displayName: displayName,
          photoUrl: docSnap.data()?.photoURL,
          affiliation: affiliation,
          bio: docSnap.data()?.bio ?? null,
          numFollowers: docSnap.data()?.followers.length,
          email: docSnap.data()?.email,
          role: docSnap.data()?.role ? UserRole.ADMIN : UserRole.USER,
          following: [], // temperory set to empty since it's unused and will be removed after migration
        }),
      };
    }),
  getMe: publicProcedure
    .output(z.object({ user: userSchema.nullable() }))
    .query(async (opts) => {
      const { tokens } = opts.ctx;
      if (!tokens) {
        return {
          user: null,
        };
      }
      const user = await getUserByTokens(tokens);
      return {
        user,
      };
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
