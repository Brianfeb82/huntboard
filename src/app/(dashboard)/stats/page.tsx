import { Briefcase, CalendarClock, Clock, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusPieChart } from "@/components/dashboard/status-pie-chart";
import { TimelineChart } from "@/components/dashboard/timeline-chart";
import { getCurrentUser } from "@/lib/session";
import { computeStats } from "@/lib/stats";

export default async function StatsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const stats = await computeStats(user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of your job search progress</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          title="Avg Days to Response"
          value={stats.avgDaysToResponse === null ? "—" : stats.avgDaysToResponse}
          subtitle={stats.avgDaysToResponse === null ? "no interviews yet" : "application to first interview"}
          icon={<Clock className="size-4 text-muted-foreground" />}
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
