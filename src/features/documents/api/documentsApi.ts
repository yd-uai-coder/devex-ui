import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/components/auth/auth-store";
import { API_BASE_URL } from "@/lib/api/base-url";
import { parseFilename } from "@/lib/api/download";

export type DocType = "requirements" | "external_design" | "internal_design" | "implementation_plan";

export type RequirementSource = "user" | "adopted" | "assumed";

// devex-api app/schemas/document.py の RequirementIssueRead・AssumedRequirementRead・
// RequirementsSummaryRead に対応する。
export type RequirementIssueRead = {
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
  issues: RequirementIssueRead[];
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
};

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
