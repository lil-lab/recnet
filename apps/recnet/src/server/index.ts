import { mergeRouters } from "./trpc";
import { publicRouter } from "./routers/public";
import { userRouter } from "./routers/user";
import { recRouter } from "./routers/rec";

export const appRouter = mergeRouters(publicRouter, userRouter, recRouter);

export type AppRouter = typeof appRouter;
