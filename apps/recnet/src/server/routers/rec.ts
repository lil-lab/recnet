import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import {
  checkFirebaseJWTProcedure,
  checkRecnetJWTProcedure,
} from "./middleware";
import { db } from "@recnet/recnet-web/firebase/admin";
import { TRPCError } from "@trpc/server";
import { recSchema, userPreviewSchema } from "@recnet/recnet-api-model";
import { getDateFromFirebaseTimestamp } from "@recnet/recnet-date-fns";
import { Month } from "@recnet/recnet-web/constant";

export const recRouter = router({
  getUpcomingRec: checkRecnetJWTProcedure
    .output(
      z.object({
        rec: recSchema.nullable(),
      })
    )
    .query(async (opts) => {
      // REFACTOR_AFTER_MIGRATION
      const { tokens } = opts.ctx;
      const email = tokens.decodedToken.email as string;
      const querySnapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();
      if (querySnapshot.empty) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const user = querySnapshot.docs[0].data();
      if (
        !user.postIds ||
        !Array.isArray(user.postIds) ||
        user.postIds.length === 0
      ) {
        return {
          rec: null,
        };
      }
      const latestRecId = user.postIds[user.postIds.length - 1];
      const recRef = db.doc(`recommendations/${latestRecId}`);
      const recSnap = await recRef.get();
      if (recSnap.exists) {
        const postData = recSnap.data();
        if (!postData) {
          return {
            rec: null,
          };
        }
        const userPreviewData = userPreviewSchema.parse({
          id: user.seed,
          handle: user.username,
          displayName: user.displayName,
          photoUrl: user.photoURL,
          affiliation: user?.affiliation ?? null,
          bio: user?.bio ?? null,
          numFollowers: user.followers.length,
        });
        const recData = recSchema.parse({
          id: latestRecId,
          description: postData.description,
          cutoff: getDateFromFirebaseTimestamp(postData.cutoff),
          user: userPreviewData,
          article: {
            id: latestRecId,
            doi: null,
            title: postData.title,
            author: postData.author,
            link: postData.link,
            year: parseInt(postData.year),
            month: !postData.month
              ? null
              : parseInt(Month[postData.month.toUpperCase()]),
            isVerified: false,
          },
        });
        return {
          rec: recData,
        };
      } else {
        return {
          rec: null,
        };
      }
    }),
});
