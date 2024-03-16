import { AppRouter } from "@recnet/recnet-web/server";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `/api/trpc`,
    }),
  ],
});
