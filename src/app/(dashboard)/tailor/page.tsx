import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { TailorPanel } from "@/components/ai/tailor-panel";
import { splitSuggestions, type AiSuggestionView } from "@/types/ai";

export default async function TailorPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [applications, resumes, latestSuggestion] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, company: true, role: true },
    }),
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, filename: true },
    }),
    prisma.aiSuggestion.findFirst({
      where: { application: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        applicationId: true,
        resumeId: true,
        matchScore: true,
        keywords: true,
        missing: true,
        suggestions: true,
        createdAt: true,
      },
    }),
  ]);

  const initialSuggestion: AiSuggestionView | null = latestSuggestion
    ? {
        ...latestSuggestion,
        keywords: (latestSuggestion.keywords as string[]) ?? [],
        missing: (latestSuggestion.missing as string[]) ?? [],
        suggestions: splitSuggestions(latestSuggestion.suggestions),
        createdAt: latestSuggestion.createdAt.toISOString(),
      }
    : null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">AI Tailor</h1>
        <p className="mt-1 text-muted-foreground">
          Compare a resume against a job description and get keyword gaps plus
          specific changes to make.
        </p>
      </div>
      <TailorPanel
        applications={applications.map((app) => ({
          id: app.id,
          label: `${app.company} — ${app.role}`,
        }))}
        resumes={resumes.map((resume) => ({
          id: resume.id,
          label: resume.filename,
        }))}
        initialSuggestion={initialSuggestion}
      />
    </div>
  );
}
