"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationStatus, JobApplication } from "@/types/application";
import { toDateInput, toIsoDate } from "@/types/application";

const statuses: { value: ApplicationStatus; label: string }[] = [
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
];

type Props = {
  application?: JobApplication;
};

export function ApplicationForm({ application }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>(application?.status ?? "APPLIED");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const form = new FormData(event.currentTarget);
    const toNumber = (name: string) => {
      const value = form.get(name)?.toString();
      return value ? Number(value) : null;
    };
    const body = {
      company: form.get("company"),
      role: form.get("role"),
      salaryMin: toNumber("salaryMin"),
      salaryMax: toNumber("salaryMax"),
      status,
      jobDescription: form.get("jobDescription"),
      location: form.get("location"),
      jobUrl: form.get("jobUrl"),
      deadline: toIsoDate(form.get("deadline")?.toString() ?? ""),
      notes: form.get("notes"),
    };

    const endpoint = application
      ? `/api/applications/${application.id}`
      : "/api/applications";
    const response = await fetch(endpoint, {
      method: application ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Could not save application");
      return;
    }

    router.push(application ? `/applications/${application.id}` : `/applications/${data.application.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" required defaultValue={application?.company} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input id="role" name="role" required defaultValue={application?.role} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="Remote, Jakarta, etc." defaultValue={application?.location ?? ""} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as ApplicationStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="salaryMin">Minimum salary</Label><Input id="salaryMin" name="salaryMin" type="number" min="0" defaultValue={application?.salaryMin ?? ""} /></div>
        <div className="space-y-2"><Label htmlFor="salaryMax">Maximum salary</Label><Input id="salaryMax" name="salaryMax" type="number" min="0" defaultValue={application?.salaryMax ?? ""} /></div>
        <div className="space-y-2"><Label htmlFor="deadline">Deadline</Label><Input id="deadline" name="deadline" type="date" defaultValue={toDateInput(application?.deadline ?? null)} /></div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobUrl">Job URL</Label>
        <Input id="jobUrl" name="jobUrl" type="url" placeholder="https://..." defaultValue={application?.jobUrl ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="jobDescription">Job description</Label>
        <Textarea id="jobDescription" name="jobDescription" className="min-h-44" placeholder="Paste the job description here for later AI tailoring." defaultValue={application?.jobDescription} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Contacts, follow-up plans, takeaways..." defaultValue={application?.notes ?? ""} />
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : application ? "Save changes" : "Create application"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
