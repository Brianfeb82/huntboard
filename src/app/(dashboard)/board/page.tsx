import Link from "next/link";
import { Briefcase, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Board } from "@/components/kanban/board";

export default async function BoardPage() {
  const user = await getCurrentUser();
  const applications = user
    ? await prisma.application.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  if (applications.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Briefcase className="mb-4 size-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-semibold">No applications yet</h2>
        <p className="mb-6 max-w-md text-muted-foreground">
          Start tracking your job applications. Add your first one to see it on the board.
        </p>
        <Link href="/applications/new">
          <Button size="lg">
            <PlusCircle className="mr-2 size-4" />
            Add Your First Application
          </Button>
        </Link>
      </div>
    );
  }

  return <Board initialApplications={JSON.parse(JSON.stringify(applications))} />;
}
