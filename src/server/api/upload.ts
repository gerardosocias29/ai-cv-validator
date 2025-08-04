import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Important for formidable
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const uploadDir = path.join(process.cwd(), "/public/uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    filename: (_name, _ext, part) => {
      return `${Date.now()}-${part.originalFilename}`;
    },
  });

  try {
    const [fields, files] = await form.parse(req) as unknown as [
      formidable.Fields,
      formidable.Files
    ];

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile || !(uploadedFile as File).filepath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${path.basename((uploadedFile as File).filepath)}`;

    return res.status(200).json({ url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
}