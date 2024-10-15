import { z } from "zod";

import {
  getRecsFeedsResponseSchema,
  getRecsFeedsParamsSchema,
  getStatsResponseSchema,
  getRecsResponseSchema,
  getRecsParamsSchema,
  getRecsUpcomingResponseSchema,
  postRecsUpcomingRequestSchema,
  patchRecsUpcomingRequestSchema,
  getRecIdResponseSchema,
  postRecsReactionsRequestSchema,
  deleteRecReactionParamsSchema,
} from "@recnet/recnet-api-model";

import {
  checkIsAdminProcedure,
  checkOptionalRecnetJWTProcedure,
  checkRecnetJWTProcedure,
} from "./middleware";

import { router } from "../trpc";

export const recRouter = router({
  getRecById: checkOptionalRecnetJWTProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(getRecIdResponseSchema)
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get(`/recs/rec/${opts.input.id}`);
      return getRecIdResponseSchema.parse(data);
    }),
  getHistoricalRecs: checkOptionalRecnetJWTProcedure
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
    .input(postRecsUpcomingRequestSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { articleId, article, description, isSelfRec } = opts.input;
      await recnetApi.post("/recs/upcoming", {
        articleId,
        article,
        description,
        isSelfRec,
      });
    }),
  editUpcomingRec: checkRecnetJWTProcedure
    .input(patchRecsUpcomingRequestSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { articleId, article, description, isSelfRec } = opts.input;
      await recnetApi.patch(`/recs/upcoming`, {
        articleId,
        article,
        description,
        isSelfRec,
      });
    }),
  deleteUpcomingRec: checkRecnetJWTProcedure.mutation(async (opts) => {
    const { recnetApi } = opts.ctx;
    await recnetApi.delete(`/recs/upcoming`);
  }),
  addReaction: checkRecnetJWTProcedure
    .input(
      postRecsReactionsRequestSchema.extend({
        recId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { recId, reaction } = opts.input;
      await recnetApi.post(`/recs/${recId}/reactions`, {
        reaction,
      });
    }),
  removeReaction: checkRecnetJWTProcedure
    .input(
      deleteRecReactionParamsSchema.extend({
        recId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { recId, reaction } = opts.input;
      await recnetApi.delete(`/recs/${recId}/reactions`, {
        params: {
          ...deleteRecReactionParamsSchema.parse({ reaction }),
        },
      });
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
