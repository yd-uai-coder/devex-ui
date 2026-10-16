import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDashboardStore } from "../dashboard-store";
import { DEFAULT_LIST_PARAMS } from "../list-params";
import { stubFetch } from "@/lib/api/test-utils/fetch-stub";

function resetStore() {
  useDashboardStore.setState({
    items: [],
    total: 0,
    status: "idle",
    error: null,
    key: null,
    fetchedAt: null,
  });
}

const SAMPLE_PROJECT = {
  id: "p1",
  title: "Project 1",
  status: "interviewing" as const,
  mode: "simple" as const,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const EMPTY_PAGE = { items: [], total: 0 };
const SECOND_PAGE = { ...DEFAULT_LIST_PARAMS, page: 2 };

describe("useDashboardStore", () => {
  let stub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    resetStore();
    stub = stubFetch();
  });

  afterEach(() => {
    stub.restore();
  });

  it("fetchProjects()は成功時にitems・total・status・key・fetchedAtを更新する", async () => {
    stub.queue({ status: 200, body: { items: [SAMPLE_PROJECT], total: 11 } });

    await useDashboardStore.getState().fetchProjects(DEFAULT_LIST_PARAMS);

    const state = useDashboardStore.getState();
    expect(state.items).toEqual([SAMPLE_PROJECT]);
    expect(state.total).toBe(11);
    expect(state.status).toBe("success");
    expect(state.key).toBe("");
    expect(state.fetchedAt).not.toBeNull();
  });

  it("同じ条件でTTL以内であればforce指定なしの再フェッチをスキップする", async () => {
    stub.queue({ status: 200, body: EMPTY_PAGE });
    await useDashboardStore.getState().fetchProjects(DEFAULT_LIST_PARAMS);

    await useDashboardStore.getState().fetchProjects({ ...DEFAULT_LIST_PARAMS });

    expect(stub.requests).toHaveLength(1);
  });

  it("条件が変わればTTL以内でも取り直す", async () => {
    stub.queue({ status: 200, body: EMPTY_PAGE });
    await useDashboardStore.getState().fetchProjects(DEFAULT_LIST_PARAMS);
    stub.queue({ status: 200, body: EMPTY_PAGE });

    await useDashboardStore.getState().fetchProjects(SECOND_PAGE);

    expect(stub.requests).toHaveLength(2);
    expect(useDashboardStore.getState().key).toBe("page=2");
  });

  it("force指定時はTTL以内でも再フェッチする", async () => {
    stub.queue({ status: 200, body: EMPTY_PAGE });
    await useDashboardStore.getState().fetchProjects(DEFAULT_LIST_PARAMS);
    stub.queue({ status: 200, body: EMPTY_PAGE });

    await useDashboardStore.getState().fetchProjects(DEFAULT_LIST_PARAMS, { force: true });

    expect(stub.requests).toHaveLength(2);
  });

  it("invalidate()後は次回のfetchProjects()がTTLを無視して再取得する", async () => {
    stub.queue({ status: 200, body: EMPTY_PAGE });
    await useDashboardStore.getState().fetchProjects(DEFAULT_LIST_PARAMS);
    useDashboardStore.getState().invalidate();
    stub.queue({ status: 200, body: EMPTY_PAGE });

    await useDashboardStore.getState().fetchProjects(DEFAULT_LIST_PARAMS);

    expect(stub.requests).toHaveLength(2);
  });

  it("取得を待つ間に条件が変わったら、古い応答を捨てる", async () => {
    stub.queue({ status: 200, body: { items: [SAMPLE_PROJECT], total: 1 } });
    stub.queue({ status: 200, body: EMPTY_PAGE });

    const old = useDashboardStore.getState().fetchProjects(DEFAULT_LIST_PARAMS);
    const latest = useDashboardStore.getState().fetchProjects(SECOND_PAGE);
    await Promise.all([old, latest]);

    const state = useDashboardStore.getState();
    expect(state.key).toBe("page=2");
    expect(state.items).toEqual([]);
  });

  it("removeProject()はすぐ一覧から外してtotalを減らし、cacheを切る(その場では取り直さない)", () => {
    const other = { ...SAMPLE_PROJECT, id: "p2", title: "Project 2" };
    useDashboardStore.setState({
      items: [SAMPLE_PROJECT, other],
      total: 12,
      status: "success",
      key: "",
      fetchedAt: Date.now(),
    });

    useDashboardStore.getState().removeProject("p1");

    const state = useDashboardStore.getState();
    expect(state.items).toEqual([other]);
    expect(state.total).toBe(11);
    expect(state.fetchedAt).toBeNull();
    expect(stub.requests).toHaveLength(0);
  });

  it("一覧に無いプロジェクトを外してもtotalは変えない(文書の画面からの削除など)", () => {
    useDashboardStore.setState({ items: [SAMPLE_PROJECT], total: 5, status: "success" });

    useDashboardStore.getState().removeProject("elsewhere");

    expect(useDashboardStore.getState().total).toBe(5);
  });

  it("失敗時はstatusをerrorにしメッセージを保持する", async () => {
    stub.queue({ status: 500, body: { detail: "Internal Server Error" } });

    await useDashboardStore.getState().fetchProjects(DEFAULT_LIST_PARAMS);

    expect(useDashboardStore.getState().status).toBe("error");
    expect(useDashboardStore.getState().error).toBeTruthy();
  });
});
