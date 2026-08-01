import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [applications, interviewCount] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      select: {
        status: true,
        createdAt: true,
        deadline: true,
        company: true,
        role: true,
        _count: { select: { interviews: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.interview.count({
      where: { application: { userId: user.id } },
    }),
  ]);

  const total = applications.length;
  const byStatus = {
    APPLIED: applications.filter((app) => app.status === "APPLIED").length,
    INTERVIEW: applications.filter((app) => app.status === "INTERVIEW").length,
    OFFER: applications.filter((app) => app.status === "OFFER").length,
    REJECTED: applications.filter((app) => app.status === "REJECTED").length,
  };

  const responseRate =
    total > 0 ? Math.round(((byStatus.INTERVIEW + byStatus.OFFER) / total) * 100) : 0;

  const now = new Date();
  const upcomingDeadlines = applications
    .filter((app) => app.deadline && new Date(app.deadline) >= now)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5)
    .map((app) => ({
      company: app.company,
      role: app.role,
      deadline: app.deadline!.toISOString(),
    }));

  const monthlyData: Record<string, number> = {};
  applications.forEach((app) => {
    const month = app.createdAt.toISOString().slice(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  const timeline = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return NextResponse.json({
    total,
    byStatus,
    responseRate,
    interviewCount,
    upcomingDeadlines,
    timeline,
  });
}
