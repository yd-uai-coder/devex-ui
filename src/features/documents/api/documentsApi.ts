import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/components/auth/auth-store";
import { API_BASE_URL } from "@/lib/api/base-url";
import { parseFilename } from "@/lib/api/download";

// test_spec(テスト仕様書)は生成の進み具合の対象に出る。文書の一覧(GET /documents)には出ない
export type DocType =
  | "requirements"
  | "external_design"
  | "internal_design"
  | "implementation_plan"
  | "test_spec";

export type RequirementSource = "user" | "adopted" | "assumed";

// devex-api app/schemas/document.py の DocumentIssueRead・AssumedRequirementRead・
// RequirementsSummaryRead・ExternalDesignSummaryRead・DocumentSummaryRead に対応する。
// 検証の指摘(4文書で共通)
export type DocumentIssueRead = {
  level: "critical" | "major" | "minor";
  code: string;
  message: string;
  targets: string[];
};

export type AssumedRequirementRead = {
  id: string;
  kind: "FR" | "NFR" | "CON";
  text: string;
};

export type RequirementsSummaryRead = {
  counts: Record<RequirementSource, number>;
  assumed: AssumedRequirementRead[];
  issues: DocumentIssueRead[];
};

export type ExternalDesignSummaryRead = {
  counts: { screens: number; apis: number; integrations: number };
  issues: DocumentIssueRead[];
};

// 内部設計書(tables / apis / modules / dataflows)・実装計画書(milestones / tasks / risks)の
// 行数と検証の指摘
export type InternalDesignSummaryRead = {
  counts: { tables: number; apis: number; modules: number; dataflows: number };
  issues: DocumentIssueRead[];
};

export type ImplementationPlanSummaryRead = {
  counts: { milestones: number; tasks: number; risks: number };
  issues: DocumentIssueRead[];
};

// devex-api app/schemas/document.py の GeneratedDocumentRead に対応する。
export type GeneratedDocumentRead = {
  id: string;
  doc_type: DocType;
  content: string;
  version: number;
  created_at: string;
  is_current: boolean;
  // 要件定義書で model を持つ版だけ(ほかの文書・以前の版は null)
  requirements?: RequirementsSummaryRead | null;
  // 外部設計書で model を持つ版だけ(ほかの文書・以前の版は null)
  external_design?: ExternalDesignSummaryRead | null;
  // 内部設計書・実装計画書で model を持つ版だけ(ほかの文書・以前の版は null)
  internal_design?: InternalDesignSummaryRead | null;
  implementation_plan?: ImplementationPlanSummaryRead | null;
};

// devex-api app/schemas/document.py の GenerationProgressRead に対応する(生成していなければ null)。
// targets は作り直す文書(上流から)、done はできた文書、current は今作っている文書。
export type GenerationProgressRead = {
  targets: DocType[];
  done: DocType[];
  current: DocType | null;
};

export function getGenerationProgress(projectId: string): Promise<GenerationProgressRead | null> {
  return apiFetch<GenerationProgressRead | null>(`/api/v1/projects/${projectId}/generation-progress`);
}

export function listDocuments(projectId: string): Promise<GeneratedDocumentRead[]> {
  return apiFetch<GeneratedDocumentRead[]>(`/api/v1/projects/${projectId}/documents`);
}

export function listDocumentVersions(
  projectId: string,
  docType: DocType,
): Promise<GeneratedDocumentRead[]> {
  return apiFetch<GeneratedDocumentRead[]>(
    `/api/v1/projects/${projectId}/documents/${docType}/versions`,
  );
}

export function restoreDocumentVersion(
  projectId: string,
  docType: DocType,
  version: number,
): Promise<GeneratedDocumentRead> {
  return apiFetch<GeneratedDocumentRead>(
    `/api/v1/projects/${projectId}/documents/${docType}/versions/${version}/restore`,
    { method: "POST" },
  );
}

// 推測の要件を、利用者が確かめた「採用」にする(同じ版の md が書き換わる。版は増えない)。
export function adoptRequirement(projectId: string, reqId: string): Promise<GeneratedDocumentRead> {
  return apiFetch<GeneratedDocumentRead>(
    `/api/v1/projects/${projectId}/documents/requirements/rows/${reqId}/adopt`,
    { method: "POST" },
  );
}

export class DownloadError extends Error {}

// ダウンロードAPIはJSONではなくMarkdown本文をそのまま返す(ファイル名はContent-Disposition
// ヘッダに含まれる)ため、JSON専用のapiFetchは使わずここだけ生のfetchで処理する。
export async function downloadDocument(
  projectId: string,
  docId: string,
): Promise<{ filename: string; content: string }> {
  const accessToken = useAuthStore.getState().accessToken;
  const res = await fetch(
    `${API_BASE_URL}/api/v1/projects/${projectId}/documents/${docId}/download`,
    {
      credentials: "include",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  );

  if (!res.ok) {
    throw new DownloadError(`ダウンロードに失敗しました(status: ${res.status})`);
  }

  const content = await res.text();
  const filename = parseFilename(res.headers.get("Content-Disposition")) ?? `${docId}.md`;
  return { filename, content };
}
