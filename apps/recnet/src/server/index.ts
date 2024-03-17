import * as trpc from "@trpc/server";
import { mergeRouters } from "./trpc";
import { publicRouter } from "./routers/public";
import { userRouter } from "./routers/user";

export const appRouter = mergeRouters(publicRouter, userRouter);

export type AppRouter = typeof appRouter;
