import { z } from "zod";

import {
  getRecsFeedsResponseSchema,
  getRecsFeedsParamsSchema,
  getRecsResponseSchema,
  getRecsParamsSchema,
} from "@recnet/recnet-api-model";

import {
  checkOptionalRecnetJWTProcedure,
  checkRecnetJWTProcedure,
} from "./middleware";

import { router } from "../trpc";

export const recRouter = router({
  getHistoricalReactions: checkOptionalRecnetJWTProcedure
    .input(
      z.object({
        cursor: z.number(),
        pageSize: z.number(),
      })
    )
    .output(getRecsResponseSchema)
    .query(async (opts) => {
      const { cursor: page, pageSize } = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/actitivies/reactions/me", {
        params: {
          ...getRecsParamsSchema.parse({ page, pageSize }),
        },
      });
      return getRecsResponseSchema.parse(data);
    }),
  getNetworkReactions: checkRecnetJWTProcedure
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
      const { data } = await recnetApi.get("/activities/reactions/following", {
        params: {
          ...getRecsFeedsParamsSchema.parse({ cutoff, page, pageSize }),
        },
      });
      return getRecsFeedsResponseSchema.parse(data);
    }),
});
