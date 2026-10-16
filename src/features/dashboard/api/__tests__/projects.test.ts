import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteProject, listProjects, toProjectMode } from "../projects";
import { DEFAULT_LIST_PARAMS } from "@/features/dashboard/list-params";
import { stubFetch } from "@/lib/api/test-utils/fetch-stub";

describe("toProjectMode", () => {
  it("simple・detailed はそのモードにし、無い・不正な値は null にする", () => {
    expect(toProjectMode("detailed")).toBe("detailed");
    expect(toProjectMode("simple")).toBe("simple");
    expect(toProjectMode(undefined)).toBeNull();
    expect(toProjectMode(["detailed"])).toBeNull();
    expect(toProjectMode("unknown")).toBeNull();
  });
});

describe("deleteProject", () => {
  let stub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    stub = stubFetch();
  });

  afterEach(() => {
    stub.restore();
  });

  // fetch のスタブは本文なしの 204 を作れないので、呼び出し先とメソッドだけを確かめる
  it("DELETE /api/v1/projects/{id} を呼ぶ", async () => {
    await deleteProject("p1");

    expect(stub.requests.map((r) => [r.init?.method, r.url.replace(/^.*(?=\/api\/)/, "")])).toEqual([
      ["DELETE", "/api/v1/projects/p1"],
    ]);
  });
});

describe("listProjects", () => {
  let stub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    stub = stubFetch();
  });

  afterEach(() => {
    stub.restore();
  });

  const path = () => stub.requests.map((r) => r.url.replace(/^.*(?=\/api\/)/, ""));

  it("条件が無ければクエリを付けず、{items, total} をそのまま返す", async () => {
    stub.queue({ status: 200, body: { items: [], total: 0 } });

    const page = await listProjects(DEFAULT_LIST_PARAMS);

    expect(page).toEqual({ items: [], total: 0 });
    expect(path()).toEqual(["/api/v1/projects"]);
  });

  it("検索語・モード・複数の進行状態・ページをクエリにする", async () => {
    stub.queue({ status: 200, body: { items: [], total: 0 } });

    await listProjects({ q: "a", mode: "detailed", statuses: ["interviewing", "completed"], page: 2 });

    expect(path()).toEqual([
      "/api/v1/projects?q=a&mode=detailed&status=interviewing&status=completed&page=2",
    ]);
  });
});
