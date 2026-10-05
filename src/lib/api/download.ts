// ファイルのダウンロードに共通する部品(文書の .md ダウンロードと UML 図の出力・詳細設計書の zip で共有する)。

import { useAuthStore } from "@/components/auth/auth-store";
import { API_BASE_URL } from "@/lib/api/base-url";
import { toApiError } from "@/lib/api/client";

// Content-Disposition: attachment; filename="..."; filename*=UTF-8''...
// のfilename*(RFC 5987、UTF-8パーセントエンコード)を優先して取り出す
// (devex-api app/api/responses.py content_dispositionが両方を含めて返す)。
export function parseFilename(header: string | null): string | null {
  if (!header) return null;
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);
  const asciiMatch = header.match(/filename="([^"]+)"/i);
  return asciiMatch ? asciiMatch[1] : null;
}

// 文字列または Blob をファイルとして保存させる(一時的な <a download> をクリックする)。
// Blob はそのまま使う(mimeType は文字列から Blob を作るときだけ使う)。
export function saveFile(filename: string, content: string | Blob, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ファイルを返すエンドポイント(Content-Disposition 付き)を生の fetch で呼ぶ。
// 本文は JSON ではないので、JSON 専用の apiFetch は使わない。失敗は apiFetch と同じ
// ApiError(code 付き)にする。図の出力(umlApi.ts)と詳細設計書の zip(designStagesApi.ts)が使う。
export async function fetchAttachment(path: string): Promise<Response> {
  const accessToken = useAuthStore.getState().accessToken;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) throw await toApiError(res);
  return res;
}
