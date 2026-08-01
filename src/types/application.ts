export type ApplicationStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export type Interview = {
  id: string;
  applicationId: string;
  date: string;
  type: "PHONE" | "TECHNICAL" | "BEHAVIORAL" | "ONSITE";
  notes: string | null;
  outcome: string | null;
};

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  salaryMin: number | null;
  salaryMax: number | null;
  status: ApplicationStatus;
  jobDescription: string;
  location: string | null;
  jobUrl: string | null;
  deadline: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  interviews?: Interview[];
};

export const BOARD_COLUMNS: {
  status: ApplicationStatus;
  label: string;
  accent: string;
}[] = [
  { status: "APPLIED", label: "Applied", accent: "border-sky-500" },
  { status: "INTERVIEW", label: "Interview", accent: "border-amber-500" },
  { status: "OFFER", label: "Offer", accent: "border-emerald-500" },
  { status: "REJECTED", label: "Rejected", accent: "border-rose-500" },
];

export function formatSalary(application: JobApplication) {
  if (application.salaryMin === null && application.salaryMax === null) return null;
  const format = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(value);

  if (application.salaryMin === null) return `Up to ${format(application.salaryMax!)}`;
  if (application.salaryMax === null) return `From ${format(application.salaryMin)}`;
  return `${format(application.salaryMin)} – ${format(application.salaryMax)}`;
}

export function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function toIsoDate(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined;
}
