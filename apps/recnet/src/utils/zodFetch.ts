import { z } from "zod";
import { createZodFetcher } from "zod-fetch";

import { clientEnv } from "@recnet/recnet-web/clientEnv";

const IS_SERVER = typeof window === "undefined";
function getURL(path: string) {
  const baseURL = IS_SERVER
    ? clientEnv.NEXT_PUBLIC_BASE_URL
    : window.location.origin;
  return new URL(path, baseURL).toString();
}

const zodFetch = createZodFetcher();

export const fetchWithZod = <ZSchema extends z.ZodSchema>(
  schema: ZSchema,
  url: string
): Promise<z.infer<ZSchema>> => {
  return zodFetch(schema, getURL(url));
};
