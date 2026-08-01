export type DashboardStats = {
  total: number;
  byStatus: {
    APPLIED: number;
    INTERVIEW: number;
    OFFER: number;
    REJECTED: number;
  };
  responseRate: number;
  interviewCount: number;
  upcomingDeadlines: Array<{
    company: string;
    role: string;
    deadline: string;
  }>;
  timeline: Array<{
    month: string;
    count: number;
  }>;
};
