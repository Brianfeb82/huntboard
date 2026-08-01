"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Interview } from "@/types/application";

export function InterviewForm({ applicationId, interviews }: { applicationId: string; interviews: Interview[] }) {
  const router = useRouter();
  const [type, setType] = useState<Interview["type"]>("PHONE");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/applications/${applicationId}/interviews`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: new Date(data.get("date")!.toString()).toISOString(), type, notes: data.get("notes"), outcome: data.get("outcome") }),
    });
    setSaving(false);
    if (!response.ok) { const body = await response.json(); setError(body.error ?? "Could not save interview"); return; }
    event.currentTarget.reset(); router.refresh();
  }

  return <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]"><form onSubmit={submit} className="space-y-3 rounded-lg border p-4"><h2 className="font-semibold">Log an interview</h2><div className="space-y-1"><Label htmlFor="interview-date">Date and time</Label><Input id="interview-date" name="date" type="datetime-local" required /></div><div className="space-y-1"><Label>Type</Label><Select value={type} onValueChange={(value) => setType(value as Interview["type"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PHONE">Phone</SelectItem><SelectItem value="TECHNICAL">Technical</SelectItem><SelectItem value="BEHAVIORAL">Behavioral</SelectItem><SelectItem value="ONSITE">Onsite</SelectItem></SelectContent></Select></div><Textarea name="notes" placeholder="Preparation notes" /><Input name="outcome" placeholder="Outcome (optional)" />{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={saving}>{saving ? "Saving..." : "Add interview"}</Button></form><section><h2 className="mb-3 font-semibold">Interview log</h2>{interviews.length === 0 ? <p className="text-sm text-muted-foreground">No interviews logged yet.</p> : <ol className="space-y-3">{interviews.map((interview) => <li key={interview.id} className="rounded-lg border p-4"><p className="font-medium">{interview.type.toLowerCase()} interview</p><p className="text-sm text-muted-foreground">{format(new Date(interview.date), "PPP p")}</p>{interview.notes && <p className="mt-2 text-sm">{interview.notes}</p>}{interview.outcome && <p className="mt-2 text-sm">Outcome: {interview.outcome}</p>}</li>)}</ol>}</section></div>;
}
