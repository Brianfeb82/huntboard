import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { missingAiConfig, tailorResume } from "@/lib/ai";

const tailorBodySchema = z.object({
  applicationId: z.string().min(1),
  resumeId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const configError = missingAiConfig();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  let body: z.infer<typeof tailorBodySchema>;
  try {
    body = tailorBodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "applicationId and resumeId are required" },
      { status: 400 }
    );
  }

  const [application, resume] = await Promise.all([
    prisma.application.findFirst({
      where: { id: body.applicationId, userId: user.id },
      select: { id: true, jobDescription: true },
    }),
    prisma.resume.findFirst({
      where: { id: body.resumeId, userId: user.id },
      select: { id: true, contentText: true },
    }),
  ]);

  if (!application || !resume) {
    return NextResponse.json(
      { error: "Application or resume not found" },
      { status: 404 }
    );
  }

  const jobDescription = application.jobDescription.trim();
  const resumeText = resume.contentText.trim();

  if (!jobDescription) {
    return NextResponse.json(
      { error: "This application has no job description. Edit it and paste the JD first." },
      { status: 400 }
    );
  }
  if (!resumeText) {
    return NextResponse.json(
      { error: "This resume has no text. Upload a PDF or paste the text on the Resumes page." },
      { status: 400 }
    );
  }

  try {
    const result = await tailorResume(jobDescription, resumeText);

    const suggestion = await prisma.aiSuggestion.create({
      data: {
        applicationId: application.id,
        resumeId: resume.id,
        matchScore: result.matchScore,
        keywords: result.keywords,
        missing: result.missing,
        suggestions: result.suggestions.join("\n\n"),
      },
    });

    return NextResponse.json({ suggestion }, { status: 201 });
  } catch (error) {
    console.error("Tailor error:", error);
    const message =
      error instanceof Error && error.message.includes("AI API")
        ? "The AI provider returned an error. Please try again in a moment."
        : "The AI returned an unexpected response. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
