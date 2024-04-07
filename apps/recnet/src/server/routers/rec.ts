import { TRPCError } from "@trpc/server";
import { FieldValue } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { ErrorMessages } from "@recnet/recnet-web/constant";
import { db } from "@recnet/recnet-web/firebase/admin";

import { getNextCutOff } from "@recnet/recnet-date-fns";
import {
  getDateFromFirebaseTimestamp,
  numToMonth,
  monthToNum,
  Month,
} from "@recnet/recnet-date-fns";

import {
  getRecsFeedsResponseSchema,
  getRecsFeedsParamsSchema,
  getStatsResponseSchema,
  recSchema,
  userPreviewSchema,
  getRecsResponseSchema,
  getRecsParamsSchema,
} from "@recnet/recnet-api-model";

import { checkIsAdminProcedure, checkRecnetJWTProcedure } from "./middleware";

import { publicProcedure, router } from "../trpc";

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
          message: ErrorMessages.USER_NOT_FOUND,
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
        // check if the rec is for the current cycle
        const cutOff = getNextCutOff();
        if (
          getDateFromFirebaseTimestamp(postData.cutoff).getTime() !==
          cutOff.getTime()
        ) {
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
          cutoff: getDateFromFirebaseTimestamp(postData.cutoff).toISOString(),
          user: userPreviewData,
          article: {
            id: latestRecId,
            doi: null,
            title: postData.title,
            author: postData.author,
            link: postData.link,
            year: parseInt(postData.year),
            month: !postData.month ? null : monthToNum[postData.month as Month],
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
  addUpcomingRec: checkRecnetJWTProcedure
    .input(
      z.object({
        articleId: z.string().optional(),
        doi: z.string().optional(),
        link: z.string().url(),
        title: z.string().min(1),
        author: z.string().min(1),
        description: z.string().max(280).min(1),
        year: z.number(),
        month: z.number().optional(),
      })
    )
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const data = opts.input;
      // add rec to recommendations collection
      const { id } = await db.collection("recommendations").add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        cutoff: Timestamp.fromMillis(getNextCutOff().getTime()),
        email: user.email,
        userId: user.id,
        year: data.year.toString(),
        month: data.month ? numToMonth[data.month] : "",
      });
      // update user's recs
      const userRef = db.doc(`users/${user.id}`);
      await userRef.set(
        {
          postIds: FieldValue.arrayUnion(id),
        },
        { merge: true }
      );
    }),
  editUpcomingRec: checkRecnetJWTProcedure
    .input(
      z.object({
        // REFACTOR_AFTER_MIGRATION: don't need id here
        id: z.string(),
        data: z.object({
          articleId: z.string().optional(),
          doi: z.string().optional(),
          link: z.string().url(),
          title: z.string().min(1),
          author: z.string().min(1),
          description: z.string().max(280).min(1),
          year: z.number(),
          month: z.number().optional(),
        }),
      })
    )
    .mutation(async (opts) => {
      const { id, data } = opts.input;
      const postRef = db.doc(`recommendations/${id}`);
      await postRef.set(
        {
          ...data,
          updatedAt: FieldValue.serverTimestamp(),
          year: data.year.toString(),
          month: data.month ? numToMonth[data.month] : "",
        },
        { merge: true }
      );
    }),
  deleteUpcomingRec: checkRecnetJWTProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      const { id } = opts.input;
      const { id: userId } = opts.ctx.user;
      const docRef = db.doc(`recommendations/${id}`);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        // delete from user postIds
        const userRef = db.doc(`users/${userId}`);
        await userRef.set(
          {
            postIds: FieldValue.arrayRemove(id),
          },
          { merge: true }
        );
        // delete post
        await docRef.delete();
      } else {
        // post doens't exist
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ErrorMessages.REC_NOT_FOUND,
        });
      }
    }),
  getHistoricalRecs: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        cursor: z.number(),
        pageSize: z.number(),
      })
    )
    .output(getRecsResponseSchema)
    .query(async (opts) => {
      const { userId, cursor: page, pageSize } = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/recs", {
        params: {
          ...getRecsParamsSchema.parse({ userId, page, pageSize }),
        },
      });
      return getRecsResponseSchema.parse(data);
    }),
  getFeeds: checkRecnetJWTProcedure
    .input(
      z.object({
        cutoff: z.number(),
        cursor: z.number(),
        pageSize: z.number(),
      })
    )
    .output(getRecsFeedsResponseSchema)
    .query(async (opts) => {
      const { cutoff, cursor: page, pageSize } = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/recs/feeds", {
        params: {
          ...getRecsFeedsParamsSchema.parse({ cutoff, page, pageSize }),
        },
      });
      return getRecsFeedsResponseSchema.parse(data);
    }),
  getNumOfRecs: checkIsAdminProcedure
    .output(
      z.object({
        num: z.number(),
      })
    )
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/stats");
      const statsData = getStatsResponseSchema.parse(data);
      return {
        num: statsData.numRecs,
      };
    }),
  getNumOfUpcomingRecs: checkIsAdminProcedure
    .output(
      z.object({
        num: z.number(),
      })
    )
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/stats");
      const statsData = getStatsResponseSchema.parse(data);
      return {
        num: statsData.numUpcomingRecs,
      };
    }),
  getRecCountByCycle: checkIsAdminProcedure
    .output(
      z.object({
        recCountByCycle: z.record(z.number()),
      })
    )
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/stats");
      const statsData = getStatsResponseSchema.parse(data);
      return {
        recCountByCycle: statsData.numRecsOverTime,
      };
    }),
});
