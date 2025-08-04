import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const cvRouter = createTRPCRouter({
  submitCv: publicProcedure
    .input(
      z.object({
        fullName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        skills: z.string(),
        experience: z.string(),
        pdfUrl: z.string().url(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.cvSubmission.create({
        data: input,
      });
    }),
});
