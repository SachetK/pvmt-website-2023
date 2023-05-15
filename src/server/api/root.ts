import { createTRPCRouter } from "~/server/api/trpc";
import { problemsRouter } from "./routers/problems";
import { reportsRouter } from "./routers/reports";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  problems: problemsRouter,
  reports: reportsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
