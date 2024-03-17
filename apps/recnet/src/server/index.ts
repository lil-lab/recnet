import * as trpc from "@trpc/server";
import { mergeRouters } from "./trpc";
import { publicRouter } from "./routers/public";

export const appRouter = mergeRouters(publicRouter);

export type AppRouter = typeof appRouter;
