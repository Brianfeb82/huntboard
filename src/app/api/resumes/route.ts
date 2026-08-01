import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { extractPdfText, storeResumeFile } from "@/lib/resume";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    let body: { filename?: string; contentText?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const contentText = body.contentText?.trim();
    if (!contentText) {
      return NextResponse.json({ error: "contentText is required" }, { status: 400 });
    }
    if (contentText.length > 50_000) {
      return NextResponse.json({ error: "Resume text must be under 50,000 characters" }, { status: 400 });
    }
    const filename = body.filename?.trim().slice(0, 160) || "Pasted resume";

    const resume = await prisma.resume.create({
      data: { userId: user.id, filename, fileUrl: "", contentText },
    });
    return NextResponse.json({ resume }, { status: 201 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });
  }

  try {
    // Extract text and upload in parallel to save time
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const [contentText, stored] = await Promise.all([
      extractPdfText(buffer),
      storeResumeFile(file),
    ]);

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        filename: file.name,
        fileUrl: stored.fileUrl,
        contentText,
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error("Resume upload error:", error);
    const message = error instanceof Error && error.message.includes("No text could be extracted")
      ? "Could not read this PDF. It may be scanned or password-protected. You can paste your resume text manually instead."
      : "Upload failed. Try a smaller PDF or paste your resume text manually.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ resumes });
}
