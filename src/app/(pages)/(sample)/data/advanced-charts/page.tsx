"use client";

import { H2, Paragraph, Separator, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { GroupedBarChart } from "@/components/ui/charts/GroupedBarChart";
import { MultiLineChart } from "@/components/ui/charts/MultiLineChart";
import { GraphCanvas } from "@/components/ui/charts/GraphCanvas";
import { GanttCanvas } from "@/components/ui/charts/GanttCanvas";

const SERVER_LOAD_GROUPS = ["サーバーA", "サーバーB", "サーバーC"];
const SERVER_LOAD_SERIES = [
  { label: "CPU使用率(%)", values: [62, 48, 81] },
  { label: "メモリ使用率(%)", values: [55, 70, 39] },
];

const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月"];
const LINEAR_SERIES = [
  { label: "新規登録数", points: [12, 18, 24, 30, 27, 35] },
  { label: "解約数", points: [4, 6, 5, 9, 8, 7] },
];
const EXPONENTIAL_SERIES = [
  { label: "処理件数(方式A)", points: [10, 20, 40, 80, 160, 320] },
  { label: "処理件数(方式B)", points: [10, 100, 1000, 10000, 100000, 1000000] },
];

const GRAPH_NODES = [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }, { id: "E" }];
const GRAPH_EDGES = [
  { id: "ab", source: "A", target: "B", weight: 4 },
  { id: "ac", source: "A", target: "C", weight: 2 },
  { id: "cb", source: "C", target: "B", weight: 1 },
  { id: "bd", source: "B", target: "D", weight: 5, directed: true },
  { id: "ce", source: "C", target: "E", weight: 8 },
];

const GANTT_BARS = [
  { id: "task-1", label: "要件定義", start: 0, end: 3, highlight: true },
  { id: "task-2", label: "設計", start: 3, end: 7, highlight: true },
  { id: "task-3", label: "資材調達", start: 3, end: 5, slack: 2 },
  { id: "task-4", label: "実装", start: 7, end: 14, highlight: true },
  { id: "task-5", label: "テスト", start: 14, end: 18, highlight: true },
];

export default function AdvancedChartsPage() {
  return (
    <YStack gap="$4">
      <Breadcrumb
        pageTitle="拡張チャート"
        description="複数系列の比較・対数軸・ノード/エッジのグラフ・ガントチャートなど、単純な棒/折れ線/円グラフでは表現しきれない可視化のサンプルです。"
      />

      <H2>グループ棒グラフ</H2>
      <Paragraph color="$color11">系列ごとに色分けした棒を、グループ(x軸ラベル)単位で並べて比較します。</Paragraph>
      <GroupedBarChart groups={SERVER_LOAD_GROUPS} series={SERVER_LOAD_SERIES} />
      <Separator alignSelf="stretch" marginHorizontal={16} />

      <H2>複数系列ラインチャート</H2>
      <Paragraph color="$color11">通常軸での比較です。</Paragraph>
      <MultiLineChart xLabels={MONTH_LABELS} series={LINEAR_SERIES} />
      <Paragraph color="$color11" marginTop="$3">
        対数軸での比較です ── 桁数が大きく異なる系列も同じグラフで見られます。
      </Paragraph>
      <MultiLineChart xLabels={MONTH_LABELS} series={EXPONENTIAL_SERIES} logScale />
      <Separator alignSelf="stretch" marginHorizontal={16} />

      <H2>ノード/エッジのグラフ</H2>
      <Paragraph color="$color11">
        座標を持たないノードは自動で円環配置されます。強調(実線)は選択された経路、破線は候補だが選ばれなかった辺、矢印は有向辺を表します。
      </Paragraph>
      <GraphCanvas
        nodes={GRAPH_NODES}
        edges={GRAPH_EDGES}
        highlightNodeIds={["A", "C", "E"]}
        highlightEdgeIds={["ac", "ce"]}
        dashedEdgeIds={["ab"]}
      />
      <Separator alignSelf="stretch" marginHorizontal={16} />

      <H2>ガントチャート</H2>
      <Paragraph color="$color11">
        強調(濃色)はクリティカルパス上のタスク、薄い延長は遅らせても全体に影響しない余裕(スラック)です。
      </Paragraph>
      <GanttCanvas bars={GANTT_BARS} />
      <Separator alignSelf="stretch" marginHorizontal={16} />
    </YStack>
  );
}
