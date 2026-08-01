"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { BadgeCheck, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Resume } from "@/types/resume";

export function ResumeList({ resumes }: { resumes: Resume[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function activate(id: string) {
    setBusyId(id);
    setError(null);
    const response = await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    setBusyId(null);
    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Could not set active resume");
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    const response = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Could not delete resume");
      return;
    }
    router.refresh();
  }

  if (resumes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No resumes yet. Upload a PDF or paste your resume text above.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {resumes.map((resume) => (
        <Card key={resume.id}>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <FileText className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-medium">
                {resume.filename}
                {resume.isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-normal text-emerald-700">
                    <BadgeCheck className="size-3" /> Active
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(resume.createdAt), "MMM d, yyyy")} ·{" "}
                {resume.contentText.length.toLocaleString()} characters extracted
              </p>
            </div>
            <div className="flex items-center gap-2">
              {resume.fileUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={resume.fileUrl} target="_blank" rel="noreferrer">View PDF</a>
                </Button>
              )}
              {!resume.isActive && (
                <Button variant="outline" size="sm" disabled={busyId === resume.id} onClick={() => activate(resume.id)}>
                  Set active
                </Button>
              )}
              <Button variant="ghost" size="sm" disabled={busyId === resume.id} onClick={() => remove(resume.id)} aria-label={`Delete ${resume.filename}`}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
