import { z } from "zod";

import { getStatsPeriodResponseSchema } from "@recnet/recnet-api-model";

import { checkIsAdminProcedure } from "./middleware";

import { router } from "../trpc";

export const statsRouter = router({
  getPeriodStats: checkIsAdminProcedure
    .input(z.number())
    .output(getStatsPeriodResponseSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get(`/stats/period/${opts.input}`);
      return getStatsPeriodResponseSchema.parse(data);
    }),
});
