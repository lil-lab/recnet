import { z } from "zod";

import { articleSchema } from "../model";

// GET /articles
export const getArticlesParamsSchema = z.object({
  link: z.string().url(),
  useDigitalLibrary: z.union([
    z.boolean(),
    z.enum(["true", "false"]).transform(val => val === "true")
  ]).default(true)
});
export type GetArticlesParams = z.infer<typeof getArticlesParamsSchema>;

export const getArticlesResponseSchema = z.object({
  article: articleSchema.nullable(),
});
export type GetArticlesResponse = z.infer<typeof getArticlesResponseSchema>;


// PATCH /articles/admin
export const AdminUpdateArticleDtoSchema = z.object({
  link: z.string().url().optional(),
  title: z.string().min(1).max(200).optional(),
  author: z.string().min(1).max(200).optional(),
  year: z.number().min(0).max(new Date().getFullYear()).optional(),
  month: z.number().min(0).max(11).optional().nullable(),
  doi: z.string().optional().nullable(),
  abstract: z.string().max(2000).optional().nullable(),
  isVerified: z.boolean().optional(),
});

export type UpdateArticleDto = z.infer<typeof AdminUpdateArticleDtoSchema>;
