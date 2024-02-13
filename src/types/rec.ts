import { z } from "zod";

export const FirebaseTsSchema = z.object({
  _seconds: z.number(),
  _nanoseconds: z.number(),
});

export type FirebaseTs = z.infer<typeof FirebaseTsSchema>;

export const RecSchema = z.object({
  author: z.string(),
  createdAt: FirebaseTsSchema,
  cutoff: FirebaseTsSchema,
  description: z.string(),
  email: z.string().email(),
  link: z.string().url(),
  year: z.string(),
  month: z
    .string()
    .transform((val) => {
      if (val === "") {
        return undefined;
      }
      return val;
    })
    .optional(), // can be empty string if not provided now, will refactor in the future
  title: z.string(),
  userId: z.string(),
  id: z.string(),
});

export type Rec = z.infer<typeof RecSchema>;
