import { z } from "zod";

import { digitalLibrarySchema } from "../model";

// GET /digital-libraries
export const getDigitalLibrariesParamsSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().optional(),
});
export type GetDigitalLibrariesParams = z.infer<
  typeof getDigitalLibrariesParamsSchema
>;

export const getDigitalLibrariesResponseSchema = z.object({
  digitalLibraries: z.array(digitalLibrarySchema),
});
export type GetDigitalLibrariesResponse = z.infer<
  typeof getDigitalLibrariesResponseSchema
>;

// POST /digital-libraries
export const postDigitalLibrariesRequestSchema = digitalLibrarySchema.omit({
  id: true,
});
export type PostDigitalLibrariesRequest = z.infer<
  typeof postDigitalLibrariesRequestSchema
>;

export const postDigitalLibrariesResponseSchema = digitalLibrarySchema;
export type PostDigitalLibrariesResponse = z.infer<
  typeof postDigitalLibrariesResponseSchema
>;

// PATCH /digital-libraries/:id
export const patchDigitalLibrariesRequestSchema = digitalLibrarySchema
  .omit({
    id: true,
    rank: true,
  })
  .partial();
export type PatchDigitalLibrariesRequest = z.infer<
  typeof patchDigitalLibrariesRequestSchema
>;

export const patchDigitalLibrariesResponseSchema = digitalLibrarySchema;

// POST /digital-libraries/rank
export const postDigitalLibrariesRankRequestSchema = z.array(
  z.object({
    id: z.number(),
    rank: z.number().min(1).max(100),
  })
);
export type PostDigitalLibrariesRankRequest = z.infer<
  typeof postDigitalLibrariesRankRequestSchema
>;
