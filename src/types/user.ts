import { z } from "zod";

export const UserSchema = z.object({
  affiliation: z.string().optional(),
  apiKey: z.string(),
  displayName: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  followers: z.array(z.string()),
  following: z.array(z.string()),
  isAnnonymous: z.boolean().optional(),
  photoURL: z.string(),
  postIds: z.array(z.string()).optional(),
  uid: z.string(),
  username: z.string(),
  seed: z.string(),
  id: z.string(),
});

export type User = z.infer<typeof UserSchema>;
