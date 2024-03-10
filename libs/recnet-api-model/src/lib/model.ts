import { z } from "zod";

export const dateSchema = z.coerce.date();

export const Roles = ["ADMIN", "USER"] as const;

export const userPreviewSchema = z.object({
  id: z.string(),
  handle: z.string(),
  displayName: z.string(),
  photoUrl: z.string().url(),
  affiliation: z.string().nullable(),
  bio: z.string().nullable(),
  numFollowers: z.number(),
});
export type UserPreview = z.infer<typeof userPreviewSchema>;

export const userSchema = userPreviewSchema.extend({
  email: z.string().email(),
  role: z.enum(Roles),
  following: z.array(userPreviewSchema),
});
export type User = z.infer<typeof userSchema>;

export const articleSchema = z.object({
  id: z.string(),
  doi: z.string().nullable(),
  title: z.string(),
  author: z.string(),
  link: z.string().url(),
  year: z.number(),
  month: z.number().min(0).max(11).nullable(),
  isVerified: z.boolean(),
});
export type Article = z.infer<typeof articleSchema>;

export const recSchema = z.object({
  id: z.string(),
  description: z.string(),
  cutoff: dateSchema,
  user: userPreviewSchema,
  article: articleSchema,
});
export type Rec = z.infer<typeof recSchema>;

export const inviteCodeSchema = z.object({
  id: z.number(),
  code: z.string(), // add further regex validation?
  owner: userPreviewSchema,
  issuedAt: dateSchema,
  usedBy: userPreviewSchema.nullable(),
  usedAt: dateSchema.nullable(),
});
export type InviteCode = z.infer<typeof inviteCodeSchema>;
