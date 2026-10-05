import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  approveDiagram,
  computeLayout,
  createDataItem,
  deleteDataItem,
  exportDiagram,
  getDiagram,
  listDataItems,
  listDiagrams,
  updateDataItem,
  updateDiagram,
  validateDiagram,
} from "../umlApi";
import type { ErSemanticModel } from "../types";
import { ApiError } from "@/lib/api/client";
import { stubFetch } from "@/lib/api/test-utils/fetch-stub";
import { COMPONENT_LAYOUT, COMPONENT_MODEL } from "@/features/uml/test-utils/umlFixtures";

const BASE = "/api/v1/projects/p1/uml";

describe("umlApi", () => {
  let stub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    stub = stubFetch();
  });

  afterEach(() => {
    stub.restore();
  });

  it.each([
    ["listDiagrams", () => listDiagrams("p1"), `${BASE}/diagrams`],
    ["getDiagram", () => getDiagram("p1", "d1"), `${BASE}/diagrams/d1`],
    ["listDataItems", () => listDataItems("p1"), `${BASE}/data-items`],
  ])("%s は GET %s を呼ぶ", async (_name, call, path) => {
    await call();

    expect(stub.requests[0].url).toMatch(new RegExp(`${path}$`));
    expect(stub.requests[0].init?.method).toBeUndefined();
  });

  it.each([
    ["validateDiagram", () => validateDiagram("p1", "d1"), `${BASE}/diagrams/d1/validate`],
    ["computeLayout", () => computeLayout("p1", "d1"), `${BASE}/diagrams/d1/layout`],
  ])("%s は本文なしで POST する", async (_name, call, path) => {
    await call();

    expect(stub.requests[0].url).toMatch(new RegExp(`${path}$`));
    expect(stub.requests[0].init?.method).toBe("POST");
    expect(stub.requests[0].init?.body).toBeUndefined();
  });

  it("updateDiagram は version・semantic_model・layout_model を PUT する", async () => {
    await updateDiagram("p1", "d1", {
      version: 3,
      semantic_model: COMPONENT_MODEL,
      layout_model: COMPONENT_LAYOUT,
    });

    expect(stub.requests[0].init?.method).toBe("PUT");
    expect(JSON.parse(stub.requests[0].init?.body as string)).toEqual({
      version: 3,
      semantic_model: COMPONENT_MODEL,
      layout_model: COMPONENT_LAYOUT,
    });
  });

  it("updateDiagram は ER の列・テーブルの制約と説明もそのまま送る", async () => {
    const model: ErSemanticModel = {
      notation: "er",
      elements: [
        {
          id: "t1",
          name: "users",
          kind: "table",
          description: "利用者",
          columns: [
            {
              name: "email",
              type: "VARCHAR(255)",
              is_primary_key: false,
              is_foreign_key: false,
              nullable: false,
              constraints: "UNIQUE",
              description: "ログイン ID",
            },
          ],
        },
      ],
      relations: [],
    };

    await updateDiagram("p1", "d1", { version: 1, semantic_model: model, layout_model: null });

    const sent = JSON.parse(stub.requests[0].init?.body as string);
    expect(sent.semantic_model.elements[0].description).toBe("利用者");
    expect(sent.semantic_model.elements[0].columns[0]).toMatchObject({
      constraints: "UNIQUE",
      description: "ログイン ID",
    });
  });

  it("データ辞書の作成・更新・削除は POST・PUT・DELETE を呼ぶ", async () => {
    const payload = { name: "予約", fields: [{ name: "id", type: "UUID" }] };
    stub.queue({ status: 201, body: { id: "i1", ...payload } });
    stub.queue({ body: { id: "i1", ...payload } });
    // fetch のスタブは本文なしの 204 を作れない(Response が本文付きの 204 を拒む)ので、
    // 削除は呼び出し先とメソッドだけを確かめる(204 の扱いは apiFetch 側のテストの範囲)

    const created = await createDataItem("p1", payload);
    await updateDataItem("p1", "i1", payload);
    await deleteDataItem("p1", "i1");

    expect(created.id).toBe("i1");
    expect(stub.requests.map((r) => [r.init?.method, r.url.replace(/^.*(?=\/api\/)/, "")])).toEqual([
      ["POST", `${BASE}/data-items`],
      ["PUT", `${BASE}/data-items/i1`],
      ["DELETE", `${BASE}/data-items/i1`],
    ]);
    expect(JSON.parse(stub.requests[1].init?.body as string)).toEqual(payload);
  });
});

// ---- 承認・出力
describe("approveDiagram", () => {
  let stub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    stub = stubFetch();
  });

  afterEach(() => {
    stub.restore();
  });

  it("POST .../approve に見ていた version を送る", async () => {
    await approveDiagram("p1", "d1", 3);

    expect(stub.requests[0].url).toMatch(new RegExp(`${BASE}/diagrams/d1/approve$`));
    expect(stub.requests[0].init?.method).toBe("POST");
    expect(JSON.parse(stub.requests[0].init?.body as string)).toEqual({ version: 3 });
  });
});

describe("exportDiagram", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ファイルの本文と Content-Disposition のファイル名を返す", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("<mxfile/>", {
        status: 200,
        headers: { "Content-Disposition": 'attachment; filename="component.drawio"' },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const file = await exportDiagram("p1", "d1", "drawio");

    expect(fetchMock.mock.calls[0][0]).toMatch(new RegExp(`${BASE}/diagrams/d1/export/drawio$`));
    expect(file).toEqual({
      filename: "component.drawio",
      content: "<mxfile/>",
      mimeType: "application/xml",
    });
  });

  it("失敗は code 付きの ApiError にする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "承認されていません", code: "UML_DIAGRAM_NOT_APPROVED" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const error = await exportDiagram("p1", "d1", "svg").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("UML_DIAGRAM_NOT_APPROVED");
  });
});
