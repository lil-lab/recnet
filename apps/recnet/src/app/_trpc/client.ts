import { createTRPCReact } from "@trpc/react-query";

import { type AppRouter } from "@recnet/recnet-web/server/index";

export const trpc = createTRPCReact<AppRouter>({});
