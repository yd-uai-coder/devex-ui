import type {
  DataItemRead,
  NotationType,
  UmlCandidatesRead,
  UmlDiagramRead,
  UmlGenerationRunRead,
} from "@/features/uml/api/types";
import { DEMO_MODELS } from "@/features/uml/demo/demoModels";

// デモページ用の固定データ(バックエンドの応答と同じ形)。

export const DEMO_PROJECT_ID = "demo";

const NOW = "2026-09-30T09:00:00Z";

function item(id: string, name: string, fields: string[]): DataItemRead {
  return { id, name, fields: fields.map((f) => ({ name: f })), created_at: NOW, updated_at: NOW };
}

// DFD のフローが参照するデータ辞書(demoModels.ts の data_item_id と対応)
export const DEMO_DATA_ITEMS: DataItemRead[] = [
  item("11111111-1111-4111-8111-111111111111", "ログイン要求", ["email", "password"]),
  item("22222222-2222-4222-8222-222222222222", "アクセストークン", ["access_token", "expires_in"]),
  item("33333333-3333-4333-8333-333333333333", "ユーザー行", ["id", "email", "hashed_password"]),
];

const SUBJECTS: Record<NotationType, string> = { component: "", er: "", dfd: "ログイン" };
const VIEWS: Record<NotationType, string> = { component: "structure", er: "data", dfd: "dataflow" };

export function demoDiagram(notation: NotationType): UmlDiagramRead {
  const { semantic_model, layout_model } = DEMO_MODELS[notation];
  return {
    id: `demo-${notation}`,
    view: VIEWS[notation],
    notation,
    subject: SUBJECTS[notation],
    scope: null,
    semantic_model,
    layout_model,
    status: "draft",
    version: 1,
    generation_status: "completed",
    generation_error: null,
    source_doc_versions: { internal_design: 1 },
    created_at: NOW,
    updated_at: NOW,
  };
}

// 生成・一覧画面の図の一覧。失敗した図も1件含める(一覧の表示の確認用)。
export function demoDiagramList(): UmlDiagramRead[] {
  return [
    demoDiagram("component"),
    demoDiagram("er"),
    demoDiagram("dfd"),
    {
      ...demoDiagram("dfd"),
      id: "demo-dfd-failed",
      subject: "プロジェクト作成",
      generation_status: "failed",
      generation_error: "AIの利用上限に達しました。時間をおいて再度生成してください。",
    },
  ];
}

export const DEMO_CANDIDATES: UmlCandidatesRead = {
  internal_design_version: 1,
  dfd_subjects: [
    { code: "DF-1", title: "ログイン" },
    { code: "DF-2", title: "プロジェクト作成" },
    { code: "DF-3", title: "チャット送信" },
    { code: "DF-4", title: "ドキュメント生成" },
    { code: "DF-5", title: "ドキュメント一覧" },
    { code: "DF-6", title: "バージョン復元" },
  ],
  er_tables: ["users", "projects", "chat_histories", "generated_documents"],
};

// クォータ超過で止まった一括生成の履歴(成功・失敗・未着手が並ぶ例)と、成功した個別生成の履歴
export const DEMO_RUNS: UmlGenerationRunRead[] = [
  {
    id: "demo-run-2",
    notation: "dfd",
    status: "partial",
    requested: [
      { subject: "ログイン", diagram_id: "demo-dfd" },
      { subject: "プロジェクト作成", diagram_id: "demo-dfd-failed" },
      { subject: "チャット送信", diagram_id: "demo-dfd-chat" },
    ],
    results: [
      { subject: "ログイン", diagram_id: "demo-dfd", outcome: "succeeded", reason_code: null, message: null },
      {
        subject: "プロジェクト作成",
        diagram_id: "demo-dfd-failed",
        outcome: "failed",
        reason_code: "QUOTA_EXCEEDED",
        message: "AIの利用上限に達しました",
      },
      {
        subject: "チャット送信",
        diagram_id: "demo-dfd-chat",
        outcome: "skipped",
        reason_code: "QUOTA_EXCEEDED",
        message: null,
      },
    ],
    started_at: "2026-09-30T09:10:00Z",
    finished_at: "2026-09-30T09:11:00Z",
  },
  {
    id: "demo-run-1",
    notation: "component",
    status: "completed",
    requested: [{ subject: "", diagram_id: "demo-component" }],
    results: [
      { subject: "", diagram_id: "demo-component", outcome: "succeeded", reason_code: null, message: null },
    ],
    started_at: NOW,
    finished_at: "2026-09-30T09:00:30Z",
  },
];
