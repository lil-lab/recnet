import { z } from "zod";

import {
  getUsersResponseSchema,
  getUsersParamsSchema,
} from "@recnet/recnet-api-model";

import { publicApiProcedure } from "./middleware";

import { router } from "../trpc";

const linkPreviewMetadataSchema = z
  .object({
    // api response schema: https://microlink.io/docs/api/getting-started/data-fields
    title: z.string().nullish(),
    description: z.string().nullish(),
    image: z
      .object({
        url: z.string().nullish(),
      })
      .nullish(),
    logo: z
      .object({
        url: z.string().nullish(),
      })
      .nullish(),
    url: z.string().nullish(),
  })
  .passthrough()
  .nullable();

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
  apiHealthCheck: publicApiProcedure
    .output(z.object({ ok: z.boolean() }))
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      try {
        await recnetApi.get("/health");
        return { ok: true };
      } catch {
        return { ok: false };
      }
    }),
  getLinkPreviewMetadata: publicApiProcedure
    .input(
      z.object({
        url: z.string(),
      })
    )
    .output(linkPreviewMetadataSchema)
    .query(async (opts) => {
      try {
        const res = await fetch(
          `https://api.microlink.io/?url=${opts.input.url}`,
          {
            cache: "force-cache",
          }
        ).then((res) => res.json());
        return linkPreviewMetadataSchema.parse(res.data);
      } catch (e) {
        console.error(e);
        return null;
      }
    }),
});
