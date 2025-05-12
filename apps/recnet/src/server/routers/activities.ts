import { z } from "zod";

import {
  getActivitiesParamsSchema,
  getActivitiesResponseSchema,
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
});
