import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ResumeUpload } from "@/components/forms/resume-upload";
import { ResumeList } from "@/components/resumes/resume-list";

export default async function ResumesPage() {
  const user = await getCurrentUser();
  const resumes = user
    ? await prisma.resume.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Resumes</h1>
        <p className="mt-1 text-muted-foreground">
          Upload your resume once, then use AI Tailor to match it against job
          descriptions.
        </p>
      </div>
      <ResumeUpload />
      <div className="mt-8">
        <h2 className="mb-3 font-semibold">Saved resumes</h2>
        <ResumeList resumes={JSON.parse(JSON.stringify(resumes))} />
      </div>
    </div>
  );
}
