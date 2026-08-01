"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
};

export function StatCard({ title, value, subtitle, icon }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
