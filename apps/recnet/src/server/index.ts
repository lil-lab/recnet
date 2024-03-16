import * as trpc from "@trpc/server";
import { procedure, router } from "./trpc";

export const appRouter = router({
  hello: procedure.query(async () => {
    return [1, 2, 3];
  }),
});

export type AppRouter = typeof appRouter;
