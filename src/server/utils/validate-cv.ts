import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export async function validateCV(pdfUrl: string, input: {
  fullName: string;
  email: string;
  phone: string;
  skills: string;
  experience: string;
}): Promise<boolean> {
  let pdfBuffer: Buffer;
  let filePath: string;

  const urlPattern = /^https?:\/\//;

  try {
    if (urlPattern.test(pdfUrl)) {
      console.log("Fetching PDF from URL:", pdfUrl);
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      pdfBuffer = await response.buffer();
    } else {
      const projectRoot = "/var/www/html/ai-cv-validator";
      filePath = pdfUrl.startsWith("/uploads/")
        ? path.join(projectRoot, "public", pdfUrl)
        : path.isAbsolute(pdfUrl)
        ? pdfUrl
        : path.join(projectRoot, "public", pdfUrl);

      console.log("Reading PDF from local file path:", filePath);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      pdfBuffer = fs.readFileSync(filePath);
    }

    // ✅ Dynamic ESM-compatible import
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default;

    const { text } = await pdfParse(pdfBuffer);
    if (!text || text.trim().length < 100) {
      throw new Error("No readable or sufficient text found in PDF.");
    }

    console.log("Extracted PDF text length:", text.length);

    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: "https://openrouter.ai/api/v1", // Important
    });


    const prompt = `
You are an AI recruiter.

Given the resume text and the submitted applicant details below, verify if all the following fields appear in the resume and reasonably match:

- Full Name: "${input.fullName}"
- Email: "${input.email}"
- Phone: "${input.phone}"
- Skills: "${input.skills}"
- Experience: "${input.experience}"

Resume Text:
"""${text.slice(0, 3500)}"""

Instructions:
- If all fields are present and reasonably matched, respond with only: VALID
- If any field is missing or doesn't match, respond with only: INVALID
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("AI response:", completion);

    console.log("AI response text:", completion.choices[0]?.message?.content);

    const result = completion.choices[0]?.message?.content?.trim().toUpperCase();

    return result === "VALID";
  } catch (err) {
    console.error("CV validation failed:", err);
    throw new Error(`CV validation failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
