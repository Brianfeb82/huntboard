import { Briefcase, CalendarClock, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusPieChart } from "@/components/dashboard/status-pie-chart";
import { TimelineChart } from "@/components/dashboard/timeline-chart";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { DashboardStats } from "@/types/stats";

async function getStats(userId: string): Promise<DashboardStats> {
  const [applications, interviewCount] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
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
      where: { application: { userId } },
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

  return {
    total,
    byStatus,
    responseRate,
    interviewCount,
    upcomingDeadlines,
    timeline,
  };
}

export default async function StatsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const stats = await getStats(user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of your job search progress</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={stats.total}
          subtitle={stats.total === 1 ? "1 application tracked" : `${stats.total} applications tracked`}
          icon={<Briefcase className="size-4 text-muted-foreground" />}
        />
        <StatCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          subtitle={`${stats.byStatus.INTERVIEW + stats.byStatus.OFFER} responses`}
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <StatCard
          title="Interviews"
          value={stats.interviewCount}
          subtitle={stats.interviewCount === 1 ? "1 interview logged" : `${stats.interviewCount} interviews logged`}
          icon={<MessageSquare className="size-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active Deadlines"
          value={stats.upcomingDeadlines.length}
          subtitle={stats.upcomingDeadlines.length === 1 ? "1 upcoming deadline" : `${stats.upcomingDeadlines.length} upcoming deadlines`}
          icon={<CalendarClock className="size-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusPieChart data={stats.byStatus} />
        <TimelineChart data={stats.timeline} />
      </div>

      {stats.upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingDeadlines.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{item.company}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.deadline).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
