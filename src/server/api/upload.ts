import { IncomingForm } from "formidable";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uploadDir = path.join(process.cwd(), "/public/uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Upload failed" });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = uploadedFile?.filepath;

    if (!filePath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${path.basename(filePath)}`;
    res.status(200).json({ url: fileUrl });
  });
}