import { router } from "../trpc";
import { z } from "zod";
import {
  checkFirebaseJWTProcedure,
  checkRecnetJWTProcedure,
} from "./middleware";
import { db } from "@recnet/recnet-web/firebase/admin";
import { TRPCError } from "@trpc/server";
import { userSchema } from "@recnet/recnet-api-model";
import { UserRole } from "@recnet/recnet-web/constant";
import { FieldValue } from "firebase-admin/firestore";

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
        console.log("User not found");
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      // reurn user
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
        userId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { userId, targetUserId } = opts.input;
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
        userId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { userId, targetUserId } = opts.input;
      // remove from [id] user followers
      await db.doc(`users/${targetUserId}`).update({
        followers: FieldValue.arrayRemove(userId),
      });
      // remove from current user following
      await db.doc(`users/${userId}`).update({
        following: FieldValue.arrayRemove(targetUserId),
      });
    }),
});
