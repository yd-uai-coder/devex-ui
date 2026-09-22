import type { ShopMonthlyOrderSummary, ShopMonthlyTarget } from "@/db/schema";
import monthlySummaryData from "@/data/shop-monthly-order-summary.json";
import monthlyTargetsData from "@/data/shop-monthly-targets.json";
import { ChartDashboard } from "./ChartDashboard";

// src/db/db:export-jsonで生成した静的スナップショット(DB/Turso不要で動作する)。
const monthlySummary = monthlySummaryData as unknown as ShopMonthlyOrderSummary[];
const monthlyTargets = monthlyTargetsData as unknown as ShopMonthlyTarget[];

export default function ChartPage() {
  return <ChartDashboard monthlySummary={monthlySummary} monthlyTargets={monthlyTargets} />;
}
