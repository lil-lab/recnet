import { z } from "zod";

import {
  getStatsRecsResponseSchema,
  getStatsRecsParamsSchema,
} from "@recnet/recnet-api-model";

import { checkIsAdminProcedure } from "./middleware";

import { router } from "../trpc";

export const statRouter = router({
  getStatsRecs: checkIsAdminProcedure
    .input(getStatsRecsParamsSchema)
    .output(getStatsRecsResponseSchema)
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/stats/recs", {
        params: {
          ...getStatsRecsParamsSchema.parse(opts.input),
        },
      });
      return getStatsRecsResponseSchema.parse(data);
    }),
});
