import { createZodFetcher } from "zod-fetch";
import { z } from "zod";

const zodFetch = createZodFetcher();

export const fetchWithZod = <ZSchema extends z.ZodSchema>(
  schema: ZSchema,
  url: string
): Promise<z.infer<ZSchema>> => {
  return zodFetch(schema, process.env.NEXT_PUBLIC_BASE_URL + url);
};
