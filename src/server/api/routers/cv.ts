import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { validateCV } from "~/server/utils/validate-cv";

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
      let submission;

      try {
        const url = new URL(input.pdfUrl);
        const relativePath = url.pathname;
        const isValid = await validateCV(relativePath, input);

        if (!isValid) {
          throw new Error("CV validation failed: Missing key information.");
        }

        submission = await db.cvSubmission.create({
          data: input,
        });
      } catch (err: any) {
        // console.error("CV validation threw an error:", err);
        throw new Error("CV validation failed: " + err?.message);
      }

      return submission;
    }),
});
