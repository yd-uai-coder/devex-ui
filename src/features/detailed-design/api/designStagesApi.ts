import { apiFetch } from "@/lib/api/client";
import { fetchAttachment, parseFilename } from "@/lib/api/download";
import type {
  DesignStageRead,
  LogicTarget,
  SequenceRead,
  UnitAiMarkdownRead,
  UnitContextRead,
} from "./types";

const base = (projectId: string) =>
  `/api/v1/projects/${projectId}/design-stages`;

// 段階1〜8の状態(未着手の段階も含む)。詳細設計モードでないプロジェクトは409
// (DESIGN_STAGES_NOT_AVAILABLE)。
export function listDesignStages(
  projectId: string,
): Promise<DesignStageRead[]> {
  return apiFetch<DesignStageRead[]>(base(projectId));
}

// 段階の内容を保存する(楽観ロック)。未着手の段階を初めて保存するときは version に null を渡す。
export function saveDesignStage(
  projectId: string,
  stage: number,
  payload: { version: number | null; model: Record<string, unknown> },
): Promise<DesignStageRead> {
  return apiFetch<DesignStageRead>(`${base(projectId)}/${stage}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 段階を承認する。「古い」段階は、内容を変えずに承認し直せる。
export function approveDesignStage(
  projectId: string,
  stage: number,
  version: number,
): Promise<DesignStageRead> {
  return apiFetch<DesignStageRead>(`${base(projectId)}/${stage}/approve`, {
    method: "POST",
    body: JSON.stringify({ version }),
  });
}

// 段階のAIの下書きの生成を受け付ける(202)。生成はバックグラウンドで進むので、完了は
// listDesignStages のポーリング(generation_status)で待つ。
// 段階2は、保存した DFD を描くグループの数が上限を超えていると 409 DESIGN_STAGE_INVALID。
// 段階5は functionIds で下書きを作る処理を選べる(省略すると、選んだ処理のうち手順の無いもの)。
// 段階6は logics で下書きを作る関数を選べる(省略すると、選んだ関数のうち詳細の無いもの)。
// 段階8は unitIds で手順書を作る単位を選べる(省略すると、段階7の単位のうち手順書の無いもの)。
export function generateDesignStage(
  projectId: string,
  stage: number,
  functionIds?: string[],
  logics?: LogicTarget[],
  unitIds?: string[],
): Promise<DesignStageRead> {
  const body = {
    ...(functionIds ? { function_ids: functionIds } : {}),
    ...(logics ? { logics } : {}),
    ...(unitIds ? { unit_ids: unitIds } : {}),
  };
  return apiFetch<DesignStageRead>(`${base(projectId)}/${stage}/generate`, {
    method: "POST",
    ...(functionIds || logics || unitIds ? { body: JSON.stringify(body) } : {}),
  });
}

// 段階5の処理1つのシーケンス図(保存した手順から導く。図は保存しない)。段階5が開いていなければ409、
// 段階5で選んでいない処理は404。
export function getProcedureSequence(projectId: string, functionId: string): Promise<SequenceRead> {
  return apiFetch<SequenceRead>(
    `${base(projectId)}/procedures/${encodeURIComponent(functionId)}/sequence`,
  );
}

// 段階8の単位1つが参照する設計の展開(承認済みの段階1〜7から毎回導く)。段階8が開いていなければ409。
export function getUnitContext(projectId: string, unitId: string): Promise<UnitContextRead> {
  return apiFetch<UnitContextRead>(
    `${base(projectId)}/units/${encodeURIComponent(unitId)}/context`,
  );
}

// 段階8の単位1つの AI 向けの版(保存済みの手順書と承認済みの段階1〜7から組み立てる)。段階8が開いて
// いなければ409、段階7に無い単位・手順書の無い単位は404。
export function getUnitAiMarkdown(projectId: string, unitId: string): Promise<UnitAiMarkdownRead> {
  return apiFetch<UnitAiMarkdownRead>(
    `${base(projectId)}/units/${encodeURIComponent(unitId)}/ai-markdown`,
  );
}

export type DownloadedDocument = { filename: string; content: Blob };

// zip はバイナリなので text() ではなく blob() で受け取る。
async function downloadZip(url: string, fallback: string): Promise<DownloadedDocument> {
  const res = await fetchAttachment(url);
  const content = await res.blob();
  const filename = parseFilename(res.headers.get("Content-Disposition")) ?? fallback;
  return { filename, content };
}

// 詳細設計書(HTML・md)と載せた図(SVG・draw.io)、実装計画の zip。段階1〜7がすべて承認済みでなければ
// 409(DESIGN_DOCUMENT_NOT_READY)。zip に入れた図は exported になる。
export function downloadDetailedDesign(projectId: string): Promise<DownloadedDocument> {
  return downloadZip(`${base(projectId)}/document`, "detailed_design.zip");
}

// 実装手順書(index.md・単位ごとの md・AI 向けの版・HTML 1枚)の zip。段階8が承認済みでなければ 409。
export function downloadImplementationProcedure(projectId: string): Promise<DownloadedDocument> {
  return downloadZip(`${base(projectId)}/procedure-document`, "implementation_procedure.zip");
}
