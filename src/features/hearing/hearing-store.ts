import { create } from "zustand";
import { streamChat, StreamChatError } from "@/features/hearing/api/streamChat";
import {
  composeAnswerText,
  latestAiMessage,
  markSelected,
  pendingAnswers,
} from "@/features/hearing/cards";
import {
  getChatHistory,
  getHearingCompletion,
  getHearingPoints,
  getProject,
  markPointNotApplicable,
  triggerGeneration,
} from "@/features/hearing/api/hearingApi";
import type {
  ChatHistoryEntry,
  HearingCard,
  HearingCompletionCheck,
  HearingPointsView,
} from "@/features/hearing/api/hearingApi";
import type { ProjectStatus } from "@/features/dashboard/api/projects";
import type { GenerationFailure } from "@/lib/generation-failure";
import { isNotFound } from "@/lib/api/client";
import type { AsyncStatus } from "@/lib/api/types";

// 「任意項目についてヒアリングを続ける」で、サーバーが利用者の発言として残す文(楽観表示も同じ文)
export const CONTINUE_OPTIONAL_MESSAGE = "任意の項目についてもヒアリングを続けてください";

type HearingStore = {
  // 今の内容がどのプロジェクトのものか。別のプロジェクトを開いたら、前の会話・完了判定を
  // 捨ててから読む(ストアは画面をまたいで残るため)。
  projectId: string | null;
  messages: ChatHistoryEntry[];
  historyStatus: AsyncStatus;
  // 最初の読み込みが404だった(プロジェクトが削除された・無い)。画面は本体の代わりに知らせを出す
  notFound: boolean;
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
  // 観点の表(チャット画面のパネル)。発言のたびにサーバーが判定し直すので、completionと同じ
  // タイミングで取り直す。
  points: HearingPointsView | null;
  // 選択肢カードで選んでいる選択肢(カードの id → 選択肢の番号)。送信までは送らず、選び直せる。
  cardDrafts: Record<string, number>;
  // 「今まさに生成が進行中で、完了をポーリングして自動遷移すべき」ことを表す
  // (status==="generating"のときのみtrue)。過去に生成済み(completed/revising)は
  // 含めない ── 含めるとチャット画面を開くたびに/documentsへ強制的に押し戻されてしまうため。
  generationTriggered: boolean;
  // ダッシュボードの状態表示・チャット画面での「生成済みドキュメントへの常設リンク」表示判定に使う。
  projectStatus: ProjectStatus | null;
  // 直近の生成の失敗(プロジェクトの記録。次の生成を始めるまで出す)。失敗するとサーバーは状態を
  // 生成の前に戻すので、loadHistory で読み直すと完了のバナーの「生成」をもう一度押せる
  generationFailure: GenerationFailure | null;

  loadHistory: (projectId: string) => Promise<void>;
  // 選択中のカードの回答も一緒に送る(選んだ内容と text を1つの発言にする)。cardIds を渡すと、
  // そのカードの回答だけを送る(カードごとの「この回答を送る」)
  // continueOptional は、必須がそろった後も任意の観点のヒアリングを続ける(バナーのボタン)
  sendMessage: (
    projectId: string,
    text: string,
    options?: { cardIds?: string[]; continueOptional?: boolean },
  ) => Promise<void>;
  // 観点の表の画面から、未決の観点を「対象外(後で決める)」にし、表と完了判定を取り直す。
  // 失敗は呼び出し側に投げる(画面が理由を出す)
  skipPoint: (projectId: string, pointKey: string) => Promise<void>;
  // 選んだ選択肢を置く(ラジオボタンなので外さない。別の選択肢を選び直す)
  selectCardOption: (cardId: string, option: number) => void;
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
  points: null,
  cardDrafts: {} as Record<string, number>,
  generationTriggered: false,
  projectStatus: null,
  generationFailure: null,
} as const;

type StoreGet = () => HearingStore;
type StoreSet = (partial: Partial<HearingStore>) => void;

// 観点の表を取り直す。失敗はチャット自体をブロックしない(完了判定と同じ方針)。
async function loadPoints(projectId: string, get: StoreGet, set: StoreSet): Promise<void> {
  try {
    const points = await getHearingPoints(projectId);
    // 取得中に別のプロジェクトへ移っていたら、古い結果で上書きしない
    if (get().projectId === projectId) set({ points });
  } catch {
    // 表が出ないだけで、チャットは続けられる
  }
}

export const useHearingStore = create<HearingStore>((set, get) => ({
  projectId: null,
  messages: [],
  historyStatus: "idle",
  notFound: false,
  sending: false,
  streamingReply: "",
  connectionLost: false,
  streamError: null,
  completion: null,
  points: null,
  cardDrafts: {},
  generationTriggered: false,
  projectStatus: null,
  generationFailure: null,

  loadHistory: async (projectId) => {
    if (get().projectId !== projectId) {
      set({ projectId, ...PROJECT_INITIAL });
    }
    set({ historyStatus: "loading", notFound: false });
    try {
      const [messages, project] = await Promise.all([
        getChatHistory(projectId),
        getProject(projectId),
      ]);
      // 取得中に別のプロジェクトへ移っていたら、古い結果で上書きしない
      if (get().projectId !== projectId) return;
      const generationTriggered = project.status === "generating";
      set({
        messages,
        historyStatus: "success",
        generationTriggered,
        projectStatus: project.status,
        generationFailure: project.generation_failure ?? null,
      });

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
      // 観点の表は生成の後も見られるよう、状態によらず取る
      await loadPoints(projectId, get, set);
    } catch (err) {
      set({ historyStatus: "error", notFound: isNotFound(err) });
    }
  },

  sendMessage: async (projectId, text, options) => {
    // ユーザー発話は、AI応答の保存と同じタイミング(ストリームの最後)でまとめて永続化される
    // (devex-api app/services/chat_service.py)。途中で失敗するとバックエンドは発話ごと
    // 巻き戻すため、失敗を伝えられたときはこの楽観的な表示(カードの選択を含む)を取り消す。
    const previousMessages = get().messages;
    const previousDrafts = get().cardDrafts;
    const latest = latestAiMessage(previousMessages);
    const cards = latest?.cards ?? [];
    const cardIds = options?.cardIds;
    const answers = pendingAnswers(cards, previousDrafts).filter(
      (answer) => !cardIds || cardIds.includes(answer.card_id),
    );
    const optimisticUserMessage: ChatHistoryEntry = {
      id: `local-user-${Date.now()}`,
      sender: "user",
      message:
        composeAnswerText(cards, answers, text) ||
        (options?.continueOptional ? CONTINUE_OPTIONAL_MESSAGE : ""),
      created_at: new Date().toISOString(),
    };
    const answeredMessages =
      latest && answers.length > 0
        ? previousMessages.map((m) => (m === latest ? { ...m, cards: markSelected(cards, answers) } : m))
        : previousMessages;
    set((state) => ({
      messages: [...answeredMessages, optimisticUserMessage],
      // 送ったカードの返信で最新の発言が変わり、残りのカードは選べなくなるので、選択中はすべて捨てる
      cardDrafts: {},
      sending: true,
      streamingReply: "",
      connectionLost: false,
      streamError: null,
      projectStatus: state.projectStatus === "completed" ? "revising" : state.projectStatus,
    }));

    try {
      let replyCards: HearingCard[] = [];
      const streamOptions = options?.continueOptional
        ? { cardAnswers: answers, continueOptional: true }
        : { cardAnswers: answers };
      for await (const event of streamChat(projectId, text, streamOptions)) {
        if (event.kind === "delta") {
          set((state) => ({ streamingReply: state.streamingReply + event.delta }));
        } else {
          replyCards = event.cards;
        }
      }
      const aiMessage: ChatHistoryEntry = {
        id: `local-ai-${Date.now()}`,
        sender: "ai",
        message: get().streamingReply,
        cards: replyCards.length > 0 ? replyCards : null,
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
      await loadPoints(projectId, get, set);
    } catch (err) {
      if (err instanceof StreamChatError && err.code) {
        // バックエンドが失敗を伝えた(発話もカードの選択も保存されていない)。表示を送信の前に戻し、
        // 選んでいた選択肢も戻して、理由を見せる
        set({
          messages: previousMessages,
          cardDrafts: previousDrafts,
          sending: false,
          streamingReply: "",
          streamError: err.message,
        });
        return;
      }
      // 接続切断等。自動再送はせず、ユーザーに再接続を促すバナーを表示するに留める
      // (SSE切断時のAI応答部分永続化は行っていない)。
      set({ sending: false, connectionLost: true, streamingReply: "" });
    }
  },

  skipPoint: async (projectId, pointKey) => {
    const points = await markPointNotApplicable(projectId, pointKey);
    if (get().projectId !== projectId) return;
    set({ points });
    try {
      // 必須がそろえば、生成のバナーが出る(サーバーが完了判定を作り直している)
      const completion = await getHearingCompletion(projectId);
      if (get().projectId === projectId) set({ completion });
    } catch {
      // 完了判定の失敗はチャット自体をブロックしない
    }
  },

  selectCardOption: (cardId, option) =>
    set((state) => ({ cardDrafts: { ...state.cardDrafts, [cardId]: option } })),

  approveAndGenerate: async (projectId) => {
    await triggerGeneration(projectId);
    set({ generationTriggered: true, projectStatus: "generating", completion: null, generationFailure: null });
  },

  dismissConnectionLost: () => set({ connectionLost: false, streamError: null }),
}));
