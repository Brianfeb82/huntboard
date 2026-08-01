import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { analyzeJobDescription, missingAiConfig } from "@/lib/ai";

const analyzeBodySchema = z.object({
  jobDescription: z.string().trim().min(10, "Job description is too short").max(30_000),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const configError = missingAiConfig();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  let jobDescription: string;
  try {
    jobDescription = analyzeBodySchema.parse(await req.json()).jobDescription;
  } catch {
    return NextResponse.json(
      { error: "jobDescription must be between 10 and 30,000 characters" },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeJobDescription(jobDescription);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Analyze JD error:", error);
    const message =
      error instanceof Error && error.message.includes("AI API")
        ? "The AI provider returned an error. Please try again in a moment."
        : "The AI returned an unexpected response. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
