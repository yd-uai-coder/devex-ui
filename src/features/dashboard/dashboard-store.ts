import { create } from "zustand";
import { isCacheFresh } from "@/lib/api/cache";
import { listProjects } from "@/features/dashboard/api/projects";
import type { ProjectRead } from "@/features/dashboard/api/projects";
import { listParamsKey } from "@/features/dashboard/list-params";
import type { ProjectListParams } from "@/features/dashboard/list-params";
import type { AsyncStatus } from "@/lib/api/types";

type DashboardStore = {
  // 今の条件の1ページ分と、条件に合う全件数
  items: ProjectRead[];
  total: number;
  status: AsyncStatus;
  error: string | null;
  // 取得した条件の鍵(listParamsKey)。cache は最後の条件の1つだけ持つ
  key: string | null;
  fetchedAt: number | null;
  // 鍵が同じで TTL(cache.ts、既定20秒)以内なら取り直さない。force 指定時は無条件に取得し直す。
  fetchProjects: (params: ProjectListParams, options?: { force?: boolean }) => Promise<void>;
  // mutation(プロジェクト作成等)の後に呼び、次回のfetchProjects()を強制的に再取得させる。
  invalidate: () => void;
  // 削除したプロジェクトをすぐ一覧から外し、cache を切る(一覧が開いていれば、今のページを
  // 取り直して次のページの先頭を繰り上げる)。
  removeProject: (projectId: string) => void;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  items: [],
  total: 0,
  status: "idle",
  error: null,
  key: null,
  fetchedAt: null,
  fetchProjects: async (params, { force = false } = {}) => {
    const key = listParamsKey(params);
    if (!force && get().key === key && isCacheFresh(get().fetchedAt)) return;
    // 条件が変わったら、前の条件の取得時刻を消す(取得中に同じ条件で呼ばれても、前の条件の
    // 結果を新しいとみなさないため)。表示は応答が届くまで前の結果のまま。
    set((state) => ({
      status: "loading",
      error: null,
      key,
      fetchedAt: state.key === key ? state.fetchedAt : null,
    }));
    try {
      const page = await listProjects(params);
      // 待つ間に条件が変わっていたら、古い応答は捨てる
      if (get().key !== key) return;
      set({ items: page.items, total: page.total, status: "success", fetchedAt: Date.now() });
    } catch (err) {
      if (get().key !== key) return;
      set({
        status: "error",
        error: err instanceof Error ? err.message : "プロジェクト一覧の取得に失敗しました",
      });
    }
  },
  invalidate: () => set({ fetchedAt: null }),
  removeProject: (projectId) =>
    set((state) => {
      const items = state.items.filter((p) => p.id !== projectId);
      return {
        items,
        total: items.length < state.items.length ? Math.max(0, state.total - 1) : state.total,
        fetchedAt: null,
      };
    }),
}));
