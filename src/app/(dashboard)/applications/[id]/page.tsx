import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ApplicationForm } from "@/components/forms/application-form";
import { InterviewForm } from "@/components/forms/interview-form";
import { DeleteApplicationButton } from "@/components/forms/delete-application-button";

type Props = { params: Promise<{ id: string }> };

export default async function ApplicationDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const application = await prisma.application.findFirst({
    where: { id: (await params).id, userId: user.id },
    include: { interviews: { orderBy: { date: "asc" } } },
  });
  if (!application) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{application.company}</h1>
        <p className="mt-1 text-muted-foreground">{application.role}</p>
      </div>
      <ApplicationForm application={JSON.parse(JSON.stringify(application))} />
      <InterviewForm
        applicationId={application.id}
        interviews={JSON.parse(JSON.stringify(application.interviews))}
      />
      <div className="mt-10 border-t pt-6">
        <DeleteApplicationButton id={application.id} />
      </div>
    </div>
  );
}
