import { prisma } from "@/lib/prisma";
import type { DashboardStats } from "@/types/stats";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // shift so Monday = start
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

export async function computeStats(userId: string): Promise<DashboardStats> {
  const [applications, interviewCount, firstInterviews] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      select: {
        status: true,
        createdAt: true,
        deadline: true,
        company: true,
        role: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.interview.count({
      where: { application: { userId } },
    }),
    prisma.interview.findMany({
      where: { application: { userId } },
      select: {
        applicationId: true,
        date: true,
        application: { select: { createdAt: true } },
      },
      orderBy: { date: "asc" },
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

  // Avg days from application creation to each application's FIRST interview.
  const firstInterviewByApp = new Map<string, { date: Date; createdAt: Date }>();
  for (const iv of firstInterviews) {
    if (!firstInterviewByApp.has(iv.applicationId)) {
      firstInterviewByApp.set(iv.applicationId, {
        date: iv.date,
        createdAt: iv.application.createdAt,
      });
    }
  }
  const dayGaps = [...firstInterviewByApp.values()]
    .map(({ date, createdAt }) => Math.round((date.getTime() - createdAt.getTime()) / DAY_MS))
    .filter((days) => days >= 0);
  const avgDaysToResponse =
    dayGaps.length > 0
      ? Math.round((dayGaps.reduce((sum, d) => sum + d, 0) / dayGaps.length) * 10) / 10
      : null;

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

  const weeklyData = new Map<string, number>();
  for (const app of applications) {
    const week = startOfWeek(app.createdAt).toISOString().slice(0, 10);
    weeklyData.set(week, (weeklyData.get(week) ?? 0) + 1);
  }
  const timeline = [...weeklyData.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));

  return {
    total,
    byStatus,
    responseRate,
    avgDaysToResponse,
    interviewCount,
    upcomingDeadlines,
    timeline,
  };
}
