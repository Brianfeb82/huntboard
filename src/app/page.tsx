import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/board");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <main className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          HuntBoard
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Track every job application on a Kanban board, and tailor your resume
          to each job description with AI.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/register">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
