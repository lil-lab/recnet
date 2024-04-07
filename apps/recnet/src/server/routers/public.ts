import { z } from "zod";

import {
  getUsersResponseSchema,
  getUsersParamsSchema,
} from "@recnet/recnet-api-model";

import { publicApiProcedure } from "./middleware";

import { router } from "../trpc";

export const publicRouter = router({
  search: publicApiProcedure
    .input(
      z.object({
        keyword: z.string(),
        cursor: z.number(),
        pageSize: z.number(),
      })
    )
    .output(getUsersResponseSchema)
    .query(async (opt) => {
      const { keyword, cursor: page, pageSize } = opt.input;
      const { recnetApi } = opt.ctx;

      const { data } = await recnetApi.get("/users", {
        params: {
          ...getUsersParamsSchema.parse({ keyword, page, pageSize }),
        },
      });
      return getUsersResponseSchema.parse(data);
    }),
});
