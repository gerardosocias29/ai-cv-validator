import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const config = {
  runtime: "nodejs",
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob | null;

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `cv_${Date.now()}.pdf`;
    const relativeUrl = `/uploads/${filename}`;
    const fullPath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(fullPath, buffer);
    return NextResponse.json({
      message: "CV uploaded successfully",
      url: relativeUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error during upload", details: error.message },
      { status: 500 }
    );
  }
}