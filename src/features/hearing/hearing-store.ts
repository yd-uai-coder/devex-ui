import { create } from "zustand";
import { streamChat, StreamChatError } from "@/features/hearing/api/streamChat";
import {
  getChatHistory,
  getHearingCompletion,
  getProject,
  triggerGeneration,
} from "@/features/hearing/api/hearingApi";
import type { ChatHistoryEntry, HearingCompletionCheck } from "@/features/hearing/api/hearingApi";
import type { ProjectStatus } from "@/features/dashboard/api/projects";
import type { AsyncStatus } from "@/lib/api/types";

type HearingStore = {
  // 今の内容がどのプロジェクトのものか。別のプロジェクトを開いたら、前の会話・完了判定を
  // 捨ててから読む(ストアは画面をまたいで残るため)。
  projectId: string | null;
  messages: ChatHistoryEntry[];
  historyStatus: AsyncStatus;
  sending: boolean;
  // ストリーミング中のAI応答本文。完了すると`messages`へ確定エントリとして追加され、
  // 空文字に戻る。
  streamingReply: string;
  // SSE接続が完了前に切れた場合に立てるフラグ(冪等性キーが無いため自動再送はしない)。
  connectionLost: boolean;
  // バックエンドがSSEの`event: error`で伝えた失敗の内容(クォータ超過など)。接続の切断
  // (connectionLost)と分けて、何が起きたかを利用者に見せる。
  streamError: string | null;
  completion: HearingCompletionCheck | null;
  // 「今まさに生成が進行中で、完了をポーリングして自動遷移すべき」ことを表す
  // (status==="generating"のときのみtrue)。過去に生成済み(completed/revising)は
  // 含めない ── 含めるとチャット画面を開くたびに/documentsへ強制的に押し戻されてしまうため。
  generationTriggered: boolean;
  // ダッシュボードの状態表示・チャット画面での「生成済みドキュメントへの常設リンク」表示判定に使う。
  projectStatus: ProjectStatus | null;

  loadHistory: (projectId: string) => Promise<void>;
  sendMessage: (projectId: string, text: string) => Promise<void>;
  approveAndGenerate: (projectId: string) => Promise<void>;
  dismissConnectionLost: () => void;
};

// 別のプロジェクトを開いたときに戻す値
const PROJECT_INITIAL = {
  messages: [] as ChatHistoryEntry[],
  sending: false,
  streamingReply: "",
  connectionLost: false,
  streamError: null,
  completion: null,
  generationTriggered: false,
  projectStatus: null,
} as const;

export const useHearingStore = create<HearingStore>((set, get) => ({
  projectId: null,
  messages: [],
  historyStatus: "idle",
  sending: false,
  streamingReply: "",
  connectionLost: false,
  streamError: null,
  completion: null,
  generationTriggered: false,
  projectStatus: null,

  loadHistory: async (projectId) => {
    if (get().projectId !== projectId) {
      set({ projectId, ...PROJECT_INITIAL });
    }
    set({ historyStatus: "loading" });
    try {
      const [messages, project] = await Promise.all([
        getChatHistory(projectId),
        getProject(projectId),
      ]);
      // 取得中に別のプロジェクトへ移っていたら、古い結果で上書きしない
      if (get().projectId !== projectId) return;
      const generationTriggered = project.status === "generating";
      set({ messages, historyStatus: "success", generationTriggered, projectStatus: project.status });

      if (project.status === "interviewing" || project.status === "revising") {
        // ヒアリング完了バナーは画面更新・再遷移をまたいでも消えないよう、
        // マウント時に毎回サーバー側の判定を取り直す(completionはstoreに永続化していないため)。
        // revising(修正中)でも、ヒアリングが十分になれば通常通りバナーを出し再生成へ進める。
        try {
          const completion = await getHearingCompletion(projectId);
          set({ completion });
        } catch {
          // 完了判定の失敗はチャット自体をブロックしない(sendMessage側と同じ方針)
        }
      }
    } catch {
      set({ historyStatus: "error" });
    }
  },

  sendMessage: async (projectId, text) => {
    // ユーザー発話は、AI応答の保存と同じタイミング(ストリームの最後)でまとめて永続化される
    // (devex-api app/services/chat_service.py)。途中で失敗するとバックエンドは発話ごと
    // 巻き戻すため、失敗を伝えられたときはこの楽観的な表示を取り消す。
    const optimisticUserMessage: ChatHistoryEntry = {
      id: `local-user-${Date.now()}`,
      sender: "user",
      message: text,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, optimisticUserMessage],
      sending: true,
      streamingReply: "",
      connectionLost: false,
      streamError: null,
      projectStatus: state.projectStatus === "completed" ? "revising" : state.projectStatus,
    }));

    try {
      for await (const delta of streamChat(projectId, text)) {
        set((state) => ({ streamingReply: state.streamingReply + delta }));
      }
      const aiMessage: ChatHistoryEntry = {
        id: `local-ai-${Date.now()}`,
        sender: "ai",
        message: get().streamingReply,
        created_at: new Date().toISOString(),
      };
      set((state) => ({ messages: [...state.messages, aiMessage], streamingReply: "", sending: false }));

      // AI応答が完了するたびにヒアリング完了条件を確認し、十分ならユーザーへ提示する
      // (docs/external_design.md 2.3節)。失敗しても致命的ではないため無視する。
      try {
        const completion = await getHearingCompletion(projectId);
        set({ completion });
      } catch {
        // 完了判定の失敗はチャット自体をブロックしない
      }
    } catch (err) {
      if (err instanceof StreamChatError && err.code) {
        // バックエンドが失敗を伝えた(発話は保存されていない)。表示した発話を取り消し、理由を見せる
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== optimisticUserMessage.id),
          sending: false,
          streamingReply: "",
          streamError: err.message,
        }));
        return;
      }
      // 接続切断等。自動再送はせず、ユーザーに再接続を促すバナーを表示するに留める
      // (SSE切断時のAI応答部分永続化は行っていない)。
      set({ sending: false, connectionLost: true, streamingReply: "" });
    }
  },

  approveAndGenerate: async (projectId) => {
    await triggerGeneration(projectId);
    set({ generationTriggered: true, projectStatus: "generating", completion: null });
  },

  dismissConnectionLost: () => set({ connectionLost: false, streamError: null }),
}));
