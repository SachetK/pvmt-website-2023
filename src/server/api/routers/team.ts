import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const teamRouter = createTRPCRouter({
  byId: publicProcedure
    .input(
      z.object({
        teamId: z.string().cuid(),
      })
    )
    .query(async ({ input: { teamId }, ctx }) => {
      return await ctx.prisma.team.findUnique({
        where: {
          id: teamId,
        },
      });
    }),

  byUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });

    if (!user?.teamId) throw new Error("Team not found");

    return await ctx.prisma.team.findUnique({
      where: {
        id: user.teamId,
      },
    });
  }),

  byScore: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        cursor: z
          .object({
            id: z.string().cuid(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit, cursor }, ctx }) => {
      const teams = await ctx.prisma.team.findMany({
        orderBy: {
          score: "desc",
        },
        take: limit + 1,
        cursor: cursor ? cursor : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (teams.length > limit) {
        const nextItem = teams.pop();
        nextCursor = {
          id: nextItem?.id ?? "",
        };
      }

      return {
        teams,
        nextCursor,
      };
    }),

  startTest: protectedProcedure
    .input(
      z.object({
        startTime: z.coerce.date(),
      })
    )
    .mutation(async ({ input: { startTime }, ctx }) => {
      const { teamId } = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!teamId) throw new Error("Team not found");

      return await ctx.prisma.team.update({
        where: {
          id: teamId,
        },

        data: {
          startTime,
        },
      });
    }),

  submitTest: protectedProcedure
    .input(
      z.object({
        endTime: z.coerce.date(),
        answers: z
          .object({
            problemId: z.string(),
            answer: z.number(),
          })
          .array(),
      })
    )
    .mutation(async ({ input: { endTime, answers }, ctx }) => {
      const { teamId } = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!teamId) throw new Error("Team not found");

      const { problems } = await ctx.prisma.competition.findUniqueOrThrow({
        where: {
          type: "TEAM",
        },
        include: {
          problems: true,
        },
      });

      let score = 0;

      problems.forEach(({ id, answer }) => {
        if (
          answers.find(({ problemId }) => problemId === id)?.answer === answer
        ) {
          score++;
        }
      });

      return await ctx.prisma.team.update({
        where: {
          id: teamId,
        },

        data: {
          endTime,
          score,
        },
      });
    }),

    select: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input: { name }, ctx }) => {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },

        data: {
          team: {
            connect: {
              name,
            }
          }
        }
      })
    })
});
