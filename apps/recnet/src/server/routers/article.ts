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
      const { link, useDigitalLibrary } = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get(`/articles`, {
        params: {
          link,
          useDigitalLibrary,
        },
      });
      return getArticlesResponseSchema.parse(data);
    }),
  // getDbArticleByLink: checkIsAdminProcedure
  //   .input(getArticlesParamsSchema)
  //   .output(getArticlesResponseSchema)
  //   .query(async (opts) => {
  //     const { link } = opts.input;
  //     const { recnetApi } = opts.ctx;
  //     const { data } = await recnetApi.get(`/articles/db`, {
  //       params: {
  //         link,
  //       },
  //     });
  //     return getArticlesResponseSchema.parse(data);
  //   }),
  // updateArticleByLink: checkIsAdminProcedure
  //   .input(patchArticlesAdminRequestSchema)
  //   .mutation(async (opts) => {
  //     const { link, ...data } = opts.input;
  //     const { recnetApi } = opts.ctx;
  //
  //     await recnetApi.patch(`/articles/admin?link=${link}`, data);
  //   }),

  updateArticleById: checkIsAdminProcedure
    .input(patchArticlesAdminRequestSchema)
    .mutation(async (opts) => {
      const { id, ...data } = opts.input;
      const { recnetApi } = opts.ctx;

      await recnetApi.patch(`/articles/admin?id=${id}`, data);
    }),
});
