export type DashboardStats = {
  total: number;
  byStatus: {
    APPLIED: number;
    INTERVIEW: number;
    OFFER: number;
    REJECTED: number;
  };
  responseRate: number;
  /** Average days from application date to first interview. null when no interviews exist. */
  avgDaysToResponse: number | null;
  interviewCount: number;
  upcomingDeadlines: Array<{
    company: string;
    role: string;
    deadline: string;
  }>;
  /** Weekly application counts, oldest first. `week` is the Monday of that week (YYYY-MM-DD). */
  timeline: Array<{
    week: string;
    count: number;
  }>;
};
