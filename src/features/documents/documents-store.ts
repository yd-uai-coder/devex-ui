import { create } from "zustand";
import { isCacheFresh } from "@/lib/api/cache";
import { listDocuments } from "@/features/documents/api/documentsApi";
import type { GeneratedDocumentRead } from "@/features/documents/api/documentsApi";
// triggerGenerationはhearingApi.tsのものをそのまま使う
// (プロジェクトの生成トリガー自体はヒアリング画面の承認・ドキュメント画面の再生成の
// どちらでも同じ1エンドポイントであり、機能固有のロジックを持たないため)。
import { getProject, triggerGeneration } from "@/features/hearing/api/hearingApi";
import type { ProjectMode } from "@/features/dashboard/api/projects";
import type { AsyncStatus } from "@/lib/api/types";

type DocumentsStore = {
  // 今の内容がどのプロジェクトのものか。別のプロジェクトを開いたら内容を捨てて取り直す
  // (ストアは画面をまたいで残るため、キャッシュの判定にプロジェクトを含めないと、前の
  // プロジェクトの文書・タブが残る)。
  projectId: string | null;
  documents: GeneratedDocumentRead[];
  status: AsyncStatus;
  error: string | null;
  fetchedAt: number | null;
  regenerating: boolean;
  // 再生成の受け付けの失敗(生成中の 409 DOC_GENERATION_IN_PROGRESS など)
  regenerateError: string | null;
  // プロジェクトのモード。詳細設計モードでは、詳細設計(SCR-008)へのリンクを出す。
  // 取得するまでは null。
  projectMode: ProjectMode | null;

  fetchDocuments: (projectId: string, options?: { force?: boolean }) => Promise<void>;
  fetchProjectMode: (projectId: string) => Promise<void>;
  regenerate: (projectId: string) => Promise<void>;
  // useGenerationPollingのcompletedコールバックから呼ぶ。regeneratingを下ろし、
  // 一覧をforce再取得して新しいバージョンを反映する。
  onRegenerationCompleted: (projectId: string) => void;
};

// 別のプロジェクトを開いたときに戻す値
const PROJECT_INITIAL = {
  documents: [] as GeneratedDocumentRead[],
  fetchedAt: null,
  regenerating: false,
  regenerateError: null,
  projectMode: null,
} as const;

export const useDocumentsStore = create<DocumentsStore>((set, get) => ({
  projectId: null,
  documents: [],
  status: "idle",
  error: null,
  fetchedAt: null,
  regenerating: false,
  regenerateError: null,
  projectMode: null,

  fetchDocuments: async (projectId, { force = false } = {}) => {
    switchProject(set, get, projectId);
    if (!force && isCacheFresh(get().fetchedAt)) return;
    set({ status: "loading", error: null });
    try {
      const documents = await listDocuments(projectId);
      // 取得中に別のプロジェクトへ移っていたら、古い結果で上書きしない
      if (get().projectId !== projectId) return;
      set({ documents, status: "success", fetchedAt: Date.now() });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "ドキュメントの取得に失敗しました",
      });
    }
  },

  fetchProjectMode: async (projectId) => {
    switchProject(set, get, projectId);
    try {
      const project = await getProject(projectId);
      if (get().projectId !== projectId) return;
      set({ projectMode: project.mode });
    } catch {
      // モードが分からなくても文書の表示は続ける(遷移先のリンクを出さないだけ)
      set({ projectMode: null });
    }
  },

  regenerate: async (projectId) => {
    // 押した時点で regenerating にし、ボタンを無効にする(二度押しの防止。バックエンドも生成中は409)
    set({ regenerating: true, regenerateError: null });
    try {
      await triggerGeneration(projectId);
    } catch (err) {
      set({
        regenerating: false,
        regenerateError: err instanceof Error ? err.message : "再生成の開始に失敗しました",
      });
    }
  },

  onRegenerationCompleted: (projectId) => {
    set({ regenerating: false });
    void get().fetchDocuments(projectId, { force: true });
  },
}));

// 別のプロジェクトに移ったら、前のプロジェクトの内容を捨てる(detailed-design-store と同じ形)
function switchProject(
  set: (partial: Partial<DocumentsStore>) => void,
  get: () => DocumentsStore,
  projectId: string,
) {
  if (get().projectId === projectId) return;
  set({ projectId, ...PROJECT_INITIAL });
}
