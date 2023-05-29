import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

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
  
    all: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.team.findMany();
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
        }
      });
      
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
        if (answers.find(({ problemId }) => problemId === id)?.answer === answer) {
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
          

});
