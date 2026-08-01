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

  return <Board initialApplications={JSON.parse(JSON.stringify(applications))} />;
}
