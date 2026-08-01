import { ApplicationForm } from "@/components/forms/application-form";

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New application</h1>
        <p className="mt-1 text-muted-foreground">Save a role you want to pursue.</p>
      </div>
      <ApplicationForm />
    </div>
  );
}
