import { create } from "zustand";
import { ApiError } from "@/lib/api/client";
import { isCacheFresh } from "@/lib/api/cache";
import { adoptRequirement, getGenerationProgress, listDocuments } from "@/features/documents/api/documentsApi";
import type {
  DocType,
  GeneratedDocumentRead,
  GenerationProgressRead,
} from "@/features/documents/api/documentsApi";
// triggerGenerationはhearingApi.tsのものをそのまま使う
// (プロジェクトの生成トリガー自体はヒアリング画面の承認・ドキュメント画面の再生成の
// どちらでも同じ1エンドポイントであり、機能固有のロジックを持たないため)。
import { getProject, triggerGeneration } from "@/features/hearing/api/hearingApi";
import type { ProjectMode, ProjectRead } from "@/features/dashboard/api/projects";
import type { GenerationFailure } from "@/lib/generation-failure";
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
  // 直近の生成(再生成・テスト仕様書の作り直し)の失敗。プロジェクトの記録を読み、次の再生成を
  // 始めるまで出す(開き直しても残る)
  generationFailure: GenerationFailure | null;
  // プロジェクトのモード。詳細設計モードでは、詳細設計(SCR-008)へのリンクを出す。
  // 取得するまでは null。
  projectMode: ProjectMode | null;
  // プロジェクトの名前(削除の確認・知らせに出す)。取得するまでは null。
  projectTitle: string | null;
  // 「採用にする」を押している要件ID と、その失敗
  adoptingId: string | null;
  adoptError: string | null;

  fetchDocuments: (projectId: string, options?: { force?: boolean }) => Promise<void>;
  fetchProjectMode: (projectId: string) => Promise<void>;
  // startFrom は再生成の起点(その文書から下流を作り直す)。省略で全部
  // findingIds: 再生成の指示に入れる、AI 設計レビューの採用した指摘
  regenerate: (projectId: string, startFrom?: DocType, findingIds?: string[]) => Promise<void>;
  // 再生成の進み具合(生成していなければ null)。再生成中に取り直す
  progress: GenerationProgressRead | null;
  fetchProgress: (projectId: string) => Promise<void>;
  // useGenerationPollingの終わりのコールバックから呼ぶ。regeneratingを下ろし、読んだプロジェクトの
  // 失敗の記録を持ち、一覧をforce再取得して新しいバージョンを反映する(失敗なら前の版のまま)。
  onRegenerationCompleted: (projectId: string, project?: ProjectRead) => void;
  // 推測の要件を「採用」にし、返った要件定義書で一覧の同じ文書を置き換える
  adoptRequirement: (projectId: string, reqId: string) => Promise<void>;
};

// 別のプロジェクトを開いたときに戻す値
const PROJECT_INITIAL = {
  documents: [] as GeneratedDocumentRead[],
  fetchedAt: null,
  regenerating: false,
  regenerateError: null,
  generationFailure: null,
  progress: null,
  projectMode: null,
  projectTitle: null,
  adoptingId: null,
  adoptError: null,
} as const;

export const useDocumentsStore = create<DocumentsStore>((set, get) => ({
  projectId: null,
  documents: [],
  status: "idle",
  error: null,
  fetchedAt: null,
  regenerating: false,
  regenerateError: null,
  generationFailure: null,
  progress: null,
  projectMode: null,
  projectTitle: null,
  adoptingId: null,
  adoptError: null,

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
      // 生成中なら、再生成中として扱う(読み込み直した後・待つ時間の上限の後も、ボタンを押せなくし、
      // 完了を待ち直す。押すとサーバーは409を返すため)
      set({
        projectMode: project.mode,
        projectTitle: project.title,
        generationFailure: project.generation_failure ?? null,
        ...(project.status === "generating" ? { regenerating: true } : {}),
      });
    } catch {
      // モードが分からなくても文書の表示は続ける(遷移先のリンクを出さないだけ)
      set({ projectMode: null, projectTitle: null });
    }
  },

  regenerate: async (projectId, startFrom, findingIds = []) => {
    // 押した時点で regenerating にし、ボタンを無効にする(二度押しの防止。バックエンドも生成中は409)
    // 前の失敗の知らせは、次の再生成を始めたら消す(サーバーも受け付けで記録を消す)
    set({ regenerating: true, regenerateError: null, generationFailure: null, progress: null });
    try {
      await triggerGeneration(projectId, startFrom, findingIds);
    } catch (err) {
      // すでに生成中(別のタブ・前の再生成の続き)なら失敗にせず、その完了を待つ
      if (err instanceof ApiError && err.code === "DOC_GENERATION_IN_PROGRESS") return;
      set({
        regenerating: false,
        regenerateError: err instanceof Error ? err.message : "再生成の開始に失敗しました",
      });
    }
  },

  fetchProgress: async (projectId) => {
    try {
      const progress = await getGenerationProgress(projectId);
      if (get().projectId !== projectId) return;
      set({ progress });
    } catch {
      // 進み具合が取れなくても、完了の検知(プロジェクトの状態)は続ける
    }
  },

  onRegenerationCompleted: (projectId, project) => {
    set({
      regenerating: false,
      progress: null,
      ...(project ? { generationFailure: project.generation_failure ?? null } : {}),
    });
    void get().fetchDocuments(projectId, { force: true });
  },

  adoptRequirement: async (projectId, reqId) => {
    set({ adoptingId: reqId, adoptError: null });
    try {
      const updated = await adoptRequirement(projectId, reqId);
      if (get().projectId !== projectId) return;
      set({
        documents: get().documents.map((doc) => (doc.doc_type === updated.doc_type ? updated : doc)),
        adoptingId: null,
      });
    } catch (err) {
      set({
        adoptingId: null,
        adoptError: err instanceof Error ? err.message : "採用にできませんでした",
      });
    }
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
