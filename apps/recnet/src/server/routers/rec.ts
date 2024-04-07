import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { db } from "@recnet/recnet-web/firebase/admin";

import { numToMonth } from "@recnet/recnet-date-fns";

import {
  getRecsFeedsResponseSchema,
  getRecsFeedsParamsSchema,
  getStatsResponseSchema,
  getRecsResponseSchema,
  getRecsParamsSchema,
  getRecsUpcomingResponseSchema,
  postRecsUpcomingRequestSchema,
} from "@recnet/recnet-api-model";

import {
  checkIsAdminProcedure,
  checkRecnetJWTProcedure,
  publicApiProcedure,
} from "./middleware";

import { router } from "../trpc";

export const recRouter = router({
  getHistoricalRecs: publicApiProcedure
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
  getUpcomingRec: checkRecnetJWTProcedure
    .output(getRecsUpcomingResponseSchema)
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/recs/upcoming");
      return getRecsUpcomingResponseSchema.parse(data);
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
      const { recnetApi } = opts.ctx;
      const { articleId, doi, link, title, author, description, year, month } =
        opts.input;
      if (articleId) {
        await recnetApi.post("/recs/upcoming", {
          ...postRecsUpcomingRequestSchema.parse({
            articleId,
            article: null,
            description,
          }),
        });
      } else {
        await recnetApi.post("/recs/upcoming", {
          ...postRecsUpcomingRequestSchema.parse({
            articleId: null,
            article: {
              doi: doi ?? null,
              title,
              link,
              author,
              year,
              month: month ?? null,
            },
            description,
          }),
        });
      }
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
  deleteUpcomingRec: checkRecnetJWTProcedure.mutation(async (opts) => {
    const { recnetApi } = opts.ctx;
    await recnetApi.delete(`/recs/upcoming`);
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
