import type { DiagramStatus } from "@/features/uml/api/types";

// 図のエディタで共通に使う表示ラベル(値はバックエンドの列挙値)。

export const DIAGRAM_STATUS_LABELS: Record<DiagramStatus, string> = {
  draft: "下書き",
  reviewing: "レビュー中",
  approved: "承認済み",
  exported: "出力済み",
};
