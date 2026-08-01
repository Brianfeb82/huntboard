"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  data: {
    APPLIED: number;
    INTERVIEW: number;
    OFFER: number;
    REJECTED: number;
  };
};

const COLORS = {
  APPLIED: "#3b82f6",
  INTERVIEW: "#f59e0b",
  OFFER: "#10b981",
  REJECTED: "#ef4444",
};

const LABELS = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export function StatusPieChart({ data }: Props) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: LABELS[name as keyof typeof LABELS],
      value,
      color: COLORS[name as keyof typeof COLORS],
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No applications yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
