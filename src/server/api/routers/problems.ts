import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const problemsRouter = createTRPCRouter({
  getBySubject: publicProcedure
    .input(
      z
        .enum(["ALGEBRA", "GEOMETRY", "COMBINATORICS", "TEAM", "TIEBREAKER"])
        .optional()
    )
    .query(async ({ input, ctx }) => {
      if (!input) {
        return [];
      }

      return await ctx.prisma.problem.findMany({
        where: {
          category: input,
        },
      });
    }),
});
