import { apiFetch } from "@/lib/api/client";
import { toSearchParams } from "@/features/dashboard/list-params";
import type { ProjectListParams } from "@/features/dashboard/list-params";
import type { GenerationFailure } from "@/lib/generation-failure";

export type ProjectStatus = "interviewing" | "generating" | "completed" | "revising";

// simple: 簡易ドキュメントモード(4文書の一括生成) / detailed: 詳細設計モード。作成時に選び、後から変えない。
export type ProjectMode = "simple" | "detailed";

// クエリ(?mode=)などの文字列をモードにする。無い・不正な値のときは null を返す
// (作成画面はモード選択ダイアログを出して選ばせる)。
export function toProjectMode(raw: string | string[] | undefined): ProjectMode | null {
  return raw === "simple" || raw === "detailed" ? raw : null;
}

// devex-api app/schemas/project.py の ProjectRead に対応する。
export type ProjectRead = {
  id: string;
  title: string;
  status: ProjectStatus;
  mode: ProjectMode;
  // 直近の生成の失敗(次の生成を受け付けると消える)。古い応答・テストの値には無い
  generation_failure?: GenerationFailure | null;
  created_at: string;
  updated_at: string;
};

// devex-api app/schemas/project.py の ProjectListPage に対応する(1ページ分と、条件に合う全件数)。
export type ProjectListPage = {
  items: ProjectRead[];
  total: number;
};

// 条件(検索語・モード・進行状態・ページ)で絞った一覧の1ページを取る。
export function listProjects(params: ProjectListParams): Promise<ProjectListPage> {
  const query = toSearchParams(params).toString();
  return apiFetch<ProjectListPage>(`/api/v1/projects${query ? `?${query}` : ""}`);
}

// プロジェクトを削除する(204)。生成中でも削除できる。
export function deleteProject(projectId: string): Promise<void> {
  return apiFetch<void>(`/api/v1/projects/${projectId}`, { method: "DELETE" });
}
