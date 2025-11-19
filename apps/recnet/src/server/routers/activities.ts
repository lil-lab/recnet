import { z } from "zod";

import {
  getActivitiesParamsSchema,
  getActivitiesResponseSchema,
  getActivitiesFeedsParamsSchema,
  getActivitiesFeedsResponseSchema,
} from "@recnet/recnet-api-model";

import {
  checkIsAdminProcedure,
  checkOptionalRecnetJWTProcedure,
  checkRecnetJWTProcedure,
} from "./middleware";

import { router } from "../trpc";

export const activitiesRouter = router({
  getActivities: checkOptionalRecnetJWTProcedure
    .input(
      z.object({
        userId: z.string(),
        cursor: z.number(),
        pageSize: z.number(),
      })
    )
    .output(getActivitiesResponseSchema)
    .query(async (opts) => {
      const { userId, cursor: page, pageSize } = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/activities", {
        params: {
          ...getActivitiesParamsSchema.parse({ userId, page, pageSize }),
        },
      });
      return getActivitiesResponseSchema.parse(data);
    }),
  getActivitiesFeeds: checkRecnetJWTProcedure
    .input(
      z.object({
        userId: z.string(),
        cursor: z.number(),
        pageSize: z.number(),
      })
    )
    .output(getActivitiesFeedsResponseSchema)
    .query(async (opts) => {
      const { userId, cursor: page, pageSize } = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/activities/feeds", {
        params: {
          ...getActivitiesFeedsParamsSchema.parse({ userId, page, pageSize }),
        },
      });
      return getActivitiesFeedsResponseSchema.parse(data);
    }),
});
