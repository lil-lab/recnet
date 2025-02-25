import {
  patchArticlesAdminRequestSchema,
  getArticlesParamsSchema,
  getArticlesResponseSchema,
} from "@recnet/recnet-api-model";

import { checkIsAdminProcedure, checkRecnetJWTProcedure } from "./middleware";

import { router } from "../trpc";

export const articleRouter = router({
  getArticleByLink: checkRecnetJWTProcedure
    .input(getArticlesParamsSchema)
    .output(getArticlesResponseSchema)
    .query(async (opts) => {
      const { link, useDigitalLibraryFallback: useDigitalLibraryFallback } =
        opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get(`/articles`, {
        params: {
          link,
          useDigitalLibraryFallback: useDigitalLibraryFallback,
        },
      });
      return getArticlesResponseSchema.parse(data);
    }),

  updateArticleById: checkIsAdminProcedure
    .input(patchArticlesAdminRequestSchema)
    .mutation(async (opts) => {
      const { id, ...data } = opts.input;
      const { recnetApi } = opts.ctx;

      await recnetApi.patch(`/articles/admin/${id}`, data);
    }),
});
