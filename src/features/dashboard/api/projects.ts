import { apiFetch } from "@/lib/api/client";

export type ProjectStatus = "interviewing" | "generating" | "completed" | "revising";

// simple: 簡易ドキュメントモード(4文書の一括生成) / detailed: 詳細設計モード。作成時に選び、後から変えない。
export type ProjectMode = "simple" | "detailed";

// クエリ(?mode=)などの文字列をモードにする。無い・不正な値のときは簡易ドキュメントモード
// (バックエンドの既定)にする。
export function toProjectMode(raw: string | string[] | undefined): ProjectMode {
  return raw === "detailed" ? "detailed" : "simple";
}

// devex-api app/schemas/project.py の ProjectRead に対応する。
export type ProjectRead = {
  id: string;
  title: string;
  status: ProjectStatus;
  mode: ProjectMode;
  created_at: string;
  updated_at: string;
};

export function listProjects(): Promise<ProjectRead[]> {
  return apiFetch<ProjectRead[]>("/api/v1/projects");
}
