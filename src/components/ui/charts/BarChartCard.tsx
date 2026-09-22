"use client";

import { BarChart } from "@/components/ui/charts/BarChart";
import { StatCard } from "@/components/ui/data/StatCard";

type BarChartCardProps = {
  label_name: string;
  label_value: string;
  chart_values: number[];
  labels?: string[];
};

export function BarChartCard({
  label_name,
  label_value,
  chart_values,
  labels,
}: BarChartCardProps) {
  return (
    <StatCard
      label={label_name}
      value={label_value}
      subtitle="Data from the past 6 months"
    >
      <BarChart values={chart_values} height={70} labels={labels} />
    </StatCard>
  );
}
