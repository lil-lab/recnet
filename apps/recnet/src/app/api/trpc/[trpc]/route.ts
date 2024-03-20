import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@recnet/recnet-web/server";
import { createContext } from "@recnet/recnet-web/server/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => await createContext(),
  });

export { handler as GET, handler as POST };
