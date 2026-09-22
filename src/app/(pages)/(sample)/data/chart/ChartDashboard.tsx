"use client";

import { useMemo } from "react";
import { XStack, YStack } from "tamagui";
import { BarChartCard } from "@/components/ui/charts/BarChartCard";
import { LineChartCard } from "@/components/ui/charts/LineChartCard";
import { PieChartCard } from "@/components/ui/charts/PieChartCard";
import { RegionStatRow } from "@/components/ui/data/RegionStatRow";
import { Column } from "@/components/ui/primitives/Column";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import SelectGroupWithLabel from "@/components/ui/form/SelectGroupWithLabel";
import type { ShopMonthlyOrderSummary, ShopMonthlyTarget } from "@/db/schema";
import { useCascadingSelection } from "@/hooks/useCascadingSelection";
import { useTrailingWindow } from "@/hooks/useTrailingWindow";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function monthKey(year: number, month: number) {
  return `${year}-${pad2(month)}`;
}

function formatSignedNumber(diff: number) {
  const sign = diff >= 0 ? "+" : "-";
  return `${sign}${Math.abs(diff)}`;
}

function formatSignedYen(diff: number) {
  const sign = diff >= 0 ? "+" : "-";
  return `${sign}￥${Math.abs(diff).toLocaleString("ja-JP")}`;
}

export function ChartDashboard({
  monthlySummary,
  monthlyTargets,
}: {
  monthlySummary: ShopMonthlyOrderSummary[];
  monthlyTargets: ShopMonthlyTarget[];
}) {
  const summaryByMonth = useMemo(
    () => new Map(monthlySummary.map((row) => [row.年月, row])),
    [monthlySummary],
  );

  const monthsByYear = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const row of monthlyTargets) {
      const months = map.get(row.year) ?? [];
      months.push(row.month);
      map.set(row.year, months);
    }
    for (const months of map.values()) months.sort((a, b) => a - b);
    return map;
  }, [monthlyTargets]);

  const targetByMonth = useMemo(
    () => new Map(monthlyTargets.map((row) => [monthKey(row.year, row.month), row])),
    [monthlyTargets],
  );

  const years = useMemo(() => [...monthsByYear.keys()].sort((a, b) => a - b), [monthsByYear]);

  const latestTarget = useMemo(
    () =>
      [...monthlyTargets].sort((a, b) => (a.year - b.year) || (a.month - b.month)).at(-1) ?? null,
    [monthlyTargets],
  );

  const {
    parent: selectedYear,
    setParent: setSelectedYear,
    child: selectedMonth,
    setChild: setSelectedMonth,
    childOptions: monthsForSelectedYear,
  } = useCascadingSelection(
    latestTarget?.year ?? years.at(-1) ?? 0,
    latestTarget?.month ?? 1,
    (year) => monthsByYear.get(year) ?? [],
    (months) => months.at(-1) ?? 1,
  );

  const yearItems = years.map((year) => ({ value: String(year), label: `${year}年` }));
  const monthItems = monthsForSelectedYear.map((month) => ({ value: String(month), label: `${month}月` }));

  function handleYearChange(value: string) {
    setSelectedYear(Number(value));
  }

  const window6 = useTrailingWindow({ year: selectedYear, month: selectedMonth }, 6);
  const labels = window6.map(({ month }) => `${month}月`);

  const orderCounts = window6.map(({ year, month }) => summaryByMonth.get(monthKey(year, month))?.受注件数 ?? 0);
  const barLabelValue = formatSignedNumber(orderCounts.at(-1)! - orderCounts[0]);

  const revenues = window6.map(({ year, month }) => summaryByMonth.get(monthKey(year, month))?.売上額 ?? 0);
  const lineLabelValue = formatSignedYen(revenues.at(-1)! - revenues[0]);

  const selectedSummary = summaryByMonth.get(monthKey(selectedYear, selectedMonth));
  const slices = [
    { label: "トップス", value: selectedSummary?.トップス ?? 0 },
    { label: "ボトムス", value: selectedSummary?.ボトムス ?? 0 },
    { label: "シューズ", value: selectedSummary?.シューズ ?? 0 },
    { label: "バッグ", value: selectedSummary?.バッグ ?? 0 },
  ];

  const selectedTarget = targetByMonth.get(monthKey(selectedYear, selectedMonth));
  const targetAmount = selectedTarget?.target ?? 0;
  const revenueAmount = selectedSummary?.売上額 ?? 0;
  const percent = targetAmount > 0 ? Math.round((revenueAmount / targetAmount) * 100) : 0;

  return (
    <YStack gap="$5" paddingBottom="$6">
      <Breadcrumb
        pageTitle="チャート"
        description="年・月を選択すると、棒グラフ・折れ線グラフ・円グラフ・達成率がDBの実データに連動するダッシュボードです。"
      />

      <XStack flexWrap="wrap" gap="$8" alignItems="flex-start">
        <SelectGroupWithLabel
          label="年"
          labelWidth={20}
          width={160}
          items={yearItems}
          value={String(selectedYear)}
          onValueChange={handleYearChange}
          renderValue={(v) => yearItems.find((item) => item.value === v)?.label}
        />
        <SelectGroupWithLabel
          label="月"
          labelWidth={20}
          width={160}
          items={monthItems}
          value={String(selectedMonth)}
          onValueChange={(value) => setSelectedMonth(Number(value))}
          renderValue={(v) => monthItems.find((item) => item.value === v)?.label}
        />
      </XStack>

      <XStack flexWrap="wrap" gap="$4" alignItems="flex-start">
        <Column>
          <BarChartCard
            label_name="受注件数"
            label_value={barLabelValue}
            chart_values={orderCounts}
            labels={labels}
          />
          <LineChartCard
            label_name="売上金額"
            label_value={lineLabelValue}
            chart_values={revenues}
            labels={labels}
          />
        </Column>
        <Column>
          <PieChartCard slices={slices} />
          <RegionStatRow
            code="達成率"
            name="目標達成率"
            target={`￥${targetAmount.toLocaleString("ja-JP")}`}
            percent={percent}
          />
        </Column>
      </XStack>
    </YStack>
  );
}
