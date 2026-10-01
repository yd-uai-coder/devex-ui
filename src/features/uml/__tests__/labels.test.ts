import { describe, expect, it } from "vitest";
import { REASON_LABELS } from "../labels";

describe("REASON_LABELS", () => {
  it("止まった生成の回収(STALE_GENERATION)にも、止まった理由の言葉を持つ", () => {
    expect(REASON_LABELS.STALE_GENERATION).toBe("時間内に終わらなかったため中断しました");
  });
});
