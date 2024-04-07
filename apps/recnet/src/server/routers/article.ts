import {
  getArticlesParamsSchema,
  getArticlesResponseSchema,
} from "@recnet/recnet-api-model";

import { checkRecnetJWTProcedure } from "./middleware";

import { router } from "../trpc";

export const articleRouter = router({
  getArticleByLink: checkRecnetJWTProcedure
    .input(getArticlesParamsSchema)
    .output(getArticlesResponseSchema)
    .query(async (opts) => {
      const { link } = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get(`/articles`, {
        params: {
          link,
        },
      });
      return getArticlesResponseSchema.parse(data);
    }),
});
