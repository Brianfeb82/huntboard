"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchScore } from "@/components/ai/match-score";
import { splitSuggestions, type AiSuggestionView } from "@/types/ai";

type Props = {
  applications: { id: string; label: string }[];
  resumes: { id: string; label: string }[];
  initialSuggestion: AiSuggestionView | null;
};

export function TailorPanel({ applications, resumes, initialSuggestion }: Props) {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState(initialSuggestion?.applicationId ?? "");
  const [resumeId, setResumeId] = useState(initialSuggestion?.resumeId ?? "");
  const [result, setResult] = useState<AiSuggestionView | null>(initialSuggestion);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!applicationId || !resumeId) return;
    setLoading(true);
    setError(null);

    const response = await fetch("/api/ai/tailor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, resumeId }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Could not run the analysis");
      return;
    }

    const suggestion = data.suggestion as AiSuggestionView;
    setResult({
      ...suggestion,
      keywords: Array.isArray(suggestion.keywords) ? suggestion.keywords : [],
      missing: Array.isArray(suggestion.missing) ? suggestion.missing : [],
      suggestions: splitSuggestions(suggestion.suggestions as unknown as string),
    });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" /> Tailor my resume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications yet.{" "}
              <Link href="/applications/new" className="underline">
                Create one with a job description
              </Link>{" "}
              first.
            </p>
          ) : (
            <div className="space-y-2">
              <Label>Application</Label>
              <Select value={applicationId} onValueChange={setApplicationId}>
                <SelectTrigger><SelectValue placeholder="Choose an application" /></SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>{app.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No resumes yet.{" "}
              <Link href="/resumes" className="underline">
                Upload one
              </Link>{" "}
              first.
            </p>
          ) : (
            <div className="space-y-2">
              <Label>Resume</Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger><SelectValue placeholder="Choose a resume" /></SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>{resume.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            className="w-full"
            onClick={run}
            disabled={loading || !applicationId || !resumeId || applications.length === 0 || resumes.length === 0}
          >
            {loading ? "Analyzing..." : result ? "Re-run analysis" : "Analyze match"}
          </Button>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {result && (
            <p className="text-xs text-muted-foreground">
              Last analyzed{" "}
              {new Date(result.createdAt).toLocaleString()} · saved for later review
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {!result ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            Pick an application and a resume to see how well they match.
          </p>
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-8">
                <MatchScore score={result.matchScore} />
                <div className="text-center sm:text-left">
                  <h2 className="text-lg font-semibold">
                    {result.matchScore >= 75
                      ? "Strong match"
                      : result.matchScore >= 50
                        ? "Decent match — room to improve"
                        : "Weak match — needs tailoring"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on keyword overlap and how your experience lines up
                    with the job description.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Keywords found</CardTitle></CardHeader>
                <CardContent>
                  {result.keywords.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No keyword overlap detected.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Missing from resume</CardTitle></CardHeader>
                <CardContent>
                  {result.missing.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing critical missing. Nice.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.missing.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-rose-100 px-2.5 py-1 text-xs text-rose-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Suggested changes</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
