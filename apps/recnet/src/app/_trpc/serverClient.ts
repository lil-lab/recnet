import { appRouter } from "@recnet/recnet-web/server";
import { createCallerFactory } from "@recnet/recnet-web/server/trpc";
import { createContext } from "@recnet/recnet-web/server/trpc";

const createCaller = createCallerFactory(appRouter);
export const serverClient = createCaller(async () => await createContext());
