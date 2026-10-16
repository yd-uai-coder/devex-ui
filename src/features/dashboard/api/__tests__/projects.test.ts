import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteProject, toProjectMode } from "../projects";
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
