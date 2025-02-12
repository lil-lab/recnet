import { z } from "zod";

import { articleSchema } from "../model";

// GET /articles
export const getArticlesParamsSchema = z.object({
  link: z.string().url(),
  useDigitalLibrary: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((val) => val === "true"),
    ])
    .default(true),
});
export type GetArticlesParams = z.infer<typeof getArticlesParamsSchema>;

export const getArticlesResponseSchema = z.object({
  article: articleSchema.nullable(),
});
export type GetArticlesResponse = z.infer<typeof getArticlesResponseSchema>;

// PATCH /articles/admin
export const patchArticlesAdminRequestSchema = articleSchema.partial();

export type PatchArticlesAdminRequest = z.infer<
  typeof patchArticlesAdminRequestSchema
>;
