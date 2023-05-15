import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const reportsRouter = createTRPCRouter({
  byUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        contest: z.enum([
          "ALGEBRA",
          "GEOMETRY",
          "COMBINATORICS",
          "TEAM",
          "TIEBREAKER",
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

  startTest: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        contest: z.enum([
          "ALGEBRA",
          "GEOMETRY",
          "COMBINATORICS",
          "TEAM",
          "TIEBREAKER",
        ]),
      })
    )
    .mutation(async ({ input: { userId, contest }, ctx }) => {
      return await ctx.prisma.report.create({
        data: {
          student: {
            connect: {
              id: userId,
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

  submitTest: publicProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        contest: z.enum([
          "ALGEBRA",
          "GEOMETRY",
          "COMBINATORICS",
          "TEAM",
          "TIEBREAKER",
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
    .mutation(async ({ input: { userId, contest, endTime, answers }, ctx }) => {
      const report = await ctx.prisma.report.update({
        where: {
          id: {
            userId,
            subject: contest,
          },
        },
        data: {
          draft: false,
          endTime,
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
          report.competition.problems.find(
            (problem) => problem.id === problemId
          )?.answer === answer
        ) {
          score++;
        }
      });

      return score;
    }),
});
