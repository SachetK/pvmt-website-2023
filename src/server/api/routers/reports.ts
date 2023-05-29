import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const reportsRouter = createTRPCRouter({
  byUser: publicProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        contest: z.enum([
          "ALGEBRA",
          "GEOMETRY",
          "COMBINATORICS",
          "TEAM",
        ]),
      })
    )
    .query(async ({ input: { userId, contest }, ctx }) => {
      return await ctx.prisma.report.findUnique({
        where: {
          id: {
            userId,
            subject: contest,
          },
        },
      });
    }),

  startTest: protectedProcedure
    .input(
      z.object({
        contest: z.enum([
          "ALGEBRA",
          "GEOMETRY",
          "COMBINATORICS",
          "TEAM",
        ]),
      })
    )
    .mutation(async ({ input: { contest }, ctx }) => {
      return await ctx.prisma.report.create({
        data: {
          student: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          competition: {
            connect: {
              type: contest,
            },
          },
        },
      });
    }),

  submitTest: protectedProcedure
    .input(
      z.object({
        contest: z.enum([
          "ALGEBRA",
          "GEOMETRY",
          "COMBINATORICS",
          "TEAM",
        ]),
        endTime: z.coerce.date(),
        answers: z
          .object({
            problemId: z.string(),
            answer: z.number(),
          })
          .array(),
      })
    )
    .mutation(async ({ input: { contest, endTime, answers }, ctx }) => {
      const report = await ctx.prisma.report.findUnique({
        where: {
          id: {
            userId: ctx.session.user.id,
            subject: contest,
          },
        },
        include: {
          competition: {
            include: {
              problems: true,
            },
          },
        },
      });

      let score = 0;

      answers.forEach(({ problemId, answer }) => {
        if (
          report?.competition.problems.find(
            (problem) => problem.id === problemId
          )?.answer === answer
        ) {
          score++;
        }
      });

      return await ctx.prisma.report.update({
        where: {
          id: {
            userId: ctx.session.user.id,
            subject: contest,
          },
        },
        data: {
          draft: false,
          score,
          endTime,
        },
      });
    }),

  byScore: publicProcedure
    .input(
      z.object({
        contest: z.enum([
          "ALGEBRA",
          "GEOMETRY",
          "COMBINATORICS",
          "TEAM",
        ]),
        limit: z.number().default(10),
        cursor: z
          .object({
            userId: z.string().cuid(),
            subject: z.enum([
              "ALGEBRA",
              "GEOMETRY",
              "COMBINATORICS",
              "TEAM",
            ]),
          })
          .optional(),
      })
    )
    .query(async ({ input: { contest, limit, cursor }, ctx }) => {
      const reports = await ctx.prisma.report.findMany({
        where: {
          competition: {
            type: contest,
          },
        },

        take: limit + 1,

        cursor: cursor ? { id: cursor } : undefined,

        orderBy: {
          score: "desc",
        },

        include: {
          student: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (reports.length > limit) {
        const nextItem = reports.pop();
        nextCursor = {
          userId: nextItem?.userId ?? "",
          subject: nextItem?.subject ?? "ALGEBRA",
        };
      }

      return {
        reports,
        nextCursor,
      };
    }),

  allByScore: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        cursor: z
          .object({
            userId: z.string().cuid(),
            subject: z.enum([
              "ALGEBRA",
              "GEOMETRY",
              "COMBINATORICS",
              "TEAM",
            ]),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit, cursor }, ctx }) => {
      const reports = await ctx.prisma.report.findMany({
        orderBy: {
          score: "desc",
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          student: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (reports.length > limit) {
        const nextItem = reports.pop();
        nextCursor = {
          userId: nextItem?.userId ?? "",
          subject: nextItem?.subject ?? "ALGEBRA",
        };
      }

      return {
        reports,
        nextCursor,
      };
    }),
});
