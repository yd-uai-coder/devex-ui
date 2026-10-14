import { create } from "zustand";
import {
  approveDesignStage,
  generateDesignStage,
  getDesignImpact,
  listDesignStages,
  reviewImpactMarks,
  saveDesignStage,
} from "@/features/detailed-design/api/designStagesApi";
import type {
  DesignImpactRead,
  DesignStageRead,
  LogicTarget,
} from "@/features/detailed-design/api/types";
import {
  focusTargetFor,
  mayHaveImpact,
  regenerationArgs,
  resolveFixTarget,
} from "@/features/detailed-design/impactOps";
import { approvalBlockers } from "@/features/detailed-design/labels";
import { ApiError } from "@/lib/api/client";
import type { AsyncStatus } from "@/lib/api/types";

// 段階をまたいで移動した先。target は、段階5なら手順ID(F-01#4)、段階6なら関数の鍵
// (logicOps の logicKey)。移動先のパネルが開いたときに読み、そのタブを開いて行を強調してから消す。
export type StageFocus = { stage: number; target: string };

// 段階の表で強調する行(要素のキー。impactOps の elementKey)。変更の影響の「表で見る」と「段階Nで直す」
// で立て、段階を移るまで残す(focus と違い、パネルが開いても消さない)。
export type StageHighlight = { stage: number; key: string };

// 詳細設計画面(SCR-008)の状態。段階の一覧と、選んでいる段階を持つ。
type DetailedDesignStore = {
  projectId: string | null;
  stages: DesignStageRead[];
  selectedStage: number;
  status: AsyncStatus;
  error: string | null;
  // 承認の失敗(409 VERSION_CONFLICT など)。段階の一覧の取得の失敗(error)とは分けて出す。
  actionError: string | null;
  approving: boolean;
  saving: boolean;
  // 生成の受け付け(POST)を待っている間。受け付けた後の「生成中」は段階の generation_status で見る
  requestingGeneration: boolean;
  focus: StageFocus | null;
  // パネルのタブの選択(鍵 → タブ)。保存・生成でパネルが作り直されても、開いていたタブに戻すため
  // 。鍵は "5:procedure"・"6:outer"・"6:inner" など、段階と場所で決める。
  tabs: Record<string, string | null>;
  // 変更の影響(印も承認後の編集も無ければ null。取得の失敗は impactError に出し、段階の一覧は出す)
  impact: DesignImpactRead | null;
  impactError: string | null;
  // 印の確認済みの切り替えを待っている間
  reviewing: boolean;
  highlight: StageHighlight | null;

  fetchStages: (projectId: string) => Promise<void>;
  selectStage: (stage: number) => void;
  // 承認できたら true(画面は承認の完了ダイアログを出す)
  approve: (projectId: string, stage: number) => Promise<boolean>;
  // 保存に成功したら true(画面は編集中の内容を保存済みとして扱う)
  save: (
    projectId: string,
    stage: number,
    model: Record<string, unknown>,
  ) => Promise<boolean>;
  // 段階5は functionIds で下書きを作る処理を、段階6は logics で関数を、段階8は unitIds で単位を選べる。
  // findingIds は修正指示に入れる、AI 設計レビューの採用した指摘
  generate: (
    projectId: string,
    stage: number,
    functionIds?: string[],
    logics?: LogicTarget[],
    unitIds?: string[],
    findingIds?: string[],
  ) => Promise<void>;
  // 段階の印を確認済み(reviewed=false で未確認)にする。確認できたら true
  reviewMarks: (
    projectId: string,
    stage: number,
    keys: string[],
    reviewed: boolean,
  ) => Promise<boolean>;
  // 再生成の候補(要素のキー)から、段階5・6・8 の部分再生成を呼ぶ
  regenerate: (projectId: string, stage: number, keys: string[]) => Promise<void>;
  // 変更の影響の「表で見る」: その段階へ移り、表の行を強調する
  showInTable: (stage: number, key: string) => void;
  // 05↔06 のバッジ・「段階Nで直す」から、相手の段階のタブ・行へ移る(直す先の文字列から行を推定して強調する)
  jumpTo: (stage: number, target: string) => void;
  clearFocus: () => void;
  setTab: (key: string, value: string | null) => void;
};

// 最初に開く段階: まだ承認されていない最初の段階(すべて承認済みなら段階8)。
export function firstPendingStage(stages: DesignStageRead[]): number {
  return stages.find((s) => s.state !== "approved")?.stage ?? 8;
}

const CODE_MESSAGES: Record<string, string> = {
  VERSION_CONFLICT:
    "他の画面でこの段階が更新されました。最新の内容を読み込み直しました。",
  DESIGN_STAGE_INVALID:
    "検証のエラーがあるため承認できません。エラーを直して保存してから承認してください。",
  DESIGN_STAGE_GENERATION_IN_PROGRESS:
    "この段階の下書きを生成中です。完了してからもう一度お試しください。",
  DESIGN_STAGE_UNREVIEWED_IMPACT:
    "他の段階・文書の変更から届いた見直しの印が残っています。「変更の影響」で確かめて確認済みにしてから承認し直してください。",
};

function messageOf(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.code && CODE_MESSAGES[err.code]) {
    return CODE_MESSAGES[err.code];
  }
  return err instanceof Error ? err.message : fallback;
}

export const useDetailedDesignStore = create<DetailedDesignStore>(
  (set, get) => ({
    projectId: null,
    stages: [],
    selectedStage: 1,
    status: "idle",
    error: null,
    actionError: null,
    approving: false,
    saving: false,
    requestingGeneration: false,
    focus: null,
    tabs: {},
    impact: null,
    impactError: null,
    reviewing: false,
    highlight: null,

    fetchStages: async (projectId) => {
      const switching = get().projectId !== projectId;
      set({
        status: "loading",
        error: null,
        ...(switching
          ? { projectId, stages: [], tabs: {}, impact: null, highlight: null }
          : {}),
      });
      let stages: DesignStageRead[];
      try {
        stages = await listDesignStages(projectId);
        set({
          stages,
          status: "success",
          ...(switching ? { selectedStage: firstPendingStage(stages) } : {}),
        });
      } catch (err) {
        set({
          status: "error",
          error: messageOf(err, "段階の取得に失敗しました"),
        });
        return;
      }
      // 印も承認後の編集も無ければ取りに行かない
      if (!mayHaveImpact(stages)) {
        set({ impact: null, impactError: null });
        return;
      }
      try {
        set({ impact: await getDesignImpact(projectId), impactError: null });
      } catch (err) {
        set({ impactError: messageOf(err, "変更の影響の取得に失敗しました") });
      }
    },

    selectStage: (stage) =>
      set({ selectedStage: stage, actionError: null, focus: null, highlight: null }),

    approve: async (projectId, stage) => {
      const current = get().stages.find((s) => s.stage === stage);
      if (!current || current.version === null) return false;
      // 図(DFD・ER)が未承認なら、API を呼ばずに理由を出す
      const blockers = approvalBlockers(current);
      if (blockers.length > 0) {
        set({
          actionError: [
            ...blockers.map((issue) => issue.message),
            "図のエディタで承認してから、段階を承認してください。",
          ].join(" "),
        });
        return false;
      }
      set({ approving: true, actionError: null });
      let approved = false;
      try {
        await approveDesignStage(projectId, stage, current.version);
        approved = true;
      } catch (err) {
        set({ actionError: messageOf(err, "承認に失敗しました") });
      } finally {
        set({ approving: false });
      }
      // 承認すると、後ろの段階が開いたり「古い」が消えたりするため、全段階を取り直す
      await get().fetchStages(projectId);
      return approved;
    },

    save: async (projectId, stage, model) => {
      const current = get().stages.find((s) => s.stage === stage);
      if (!current) return false;
      set({ saving: true, actionError: null });
      let saved = false;
      try {
        await saveDesignStage(projectId, stage, {
          version: current.version,
          model,
        });
        saved = true;
      } catch (err) {
        set({ actionError: messageOf(err, "保存に失敗しました") });
      } finally {
        set({ saving: false });
      }
      // 保存すると、承認済みの段階はレビュー中に戻り、後ろの段階が「古い」になるため、全段階を取り直す
      await get().fetchStages(projectId);
      return saved;
    },

    generate: async (projectId, stage, functionIds, logics, unitIds, findingIds) => {
      set({ requestingGeneration: true, actionError: null });
      try {
        await generateDesignStage(projectId, stage, functionIds, logics, unitIds, findingIds);
      } catch (err) {
        // 生成の受け付けの 409 DESIGN_STAGE_INVALID(対象の数・選択)は、承認の文言でなくサーバーの理由を出す
        const invalid = err instanceof ApiError && err.code === "DESIGN_STAGE_INVALID";
        set({
          actionError: invalid
            ? err.message
            : messageOf(err, "下書きの生成を始められませんでした"),
        });
      } finally {
        set({ requestingGeneration: false });
      }
      // 受け付けた段階は generation_status が generating になる(画面はそれを見てポーリングする)
      await get().fetchStages(projectId);
    },

    reviewMarks: async (projectId, stage, keys, reviewed) => {
      set({ reviewing: true, impactError: null });
      let done = false;
      try {
        await reviewImpactMarks(projectId, stage, keys, reviewed);
        done = true;
      } catch (err) {
        set({ impactError: messageOf(err, "確認済みにできませんでした") });
      } finally {
        set({ reviewing: false });
      }
      // 段階の一覧の印の件数も変わるため、全段階を取り直す
      await get().fetchStages(projectId);
      return done;
    },

    regenerate: async (projectId, stage, keys) => {
      const plan = get().stages.find((s) => s.stage === 8)?.plan ?? null;
      const args = regenerationArgs(stage, keys, plan);
      await get().generate(projectId, stage, args.functionIds, args.logics, args.unitIds);
    },

    showInTable: (stage, key) =>
      set({
        selectedStage: stage,
        actionError: null,
        highlight: { stage, key },
        // 段階5・6 はタブを開くため、既存の移動先も立てる
        focus:
          stage === 5 || stage === 6
            ? { stage, target: focusTargetFor(stage, "", key) }
            : null,
      }),

    jumpTo: (stage, target) => {
      const key = resolveFixTarget(stage, target, get().stages);
      set({
        selectedStage: stage,
        actionError: null,
        focus: { stage, target: focusTargetFor(stage, target, key) },
        highlight: key ? { stage, key } : null,
      });
    },

    clearFocus: () => set({ focus: null }),

    setTab: (key, value) => set((state) => ({ tabs: { ...state.tabs, [key]: value } })),
  }),
);
