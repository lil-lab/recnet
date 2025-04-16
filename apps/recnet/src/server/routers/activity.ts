import { z } from "zod";

import {
  getActivitiesParamsSchema,
  getRecsResponseSchema,
} from "@recnet/recnet-api-model";

import {
  checkOptionalRecnetJWTProcedure,
  checkRecnetJWTProcedure,
} from "./middleware";

import { router } from "../trpc";

export const recRouter = router({
  getHistoricalActivities: checkOptionalRecnetJWTProcedure
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
      const { data } = await recnetApi.get("/actitivies", {
        params: {
          ...getActivitiesParamsSchema.parse({ userId, page, pageSize }),
        },
      });
      return getRecsResponseSchema.parse(data);
    }),
});
