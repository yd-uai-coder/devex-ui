import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import { DetailedDesignDemoPageContent } from "../DetailedDesignDemoPageContent";
import * as download from "@/lib/api/download";

function renderDemo() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <DetailedDesignDemoPageContent />
    </TamaguiProvider>,
  );
}

describe("DetailedDesignDemoPageContent", () => {
  it("索引・関与表・最初の処理の手順・逆引きを表示する", () => {
    renderDemo();

    const index = screen.getByRole("table", { name: "主要処理の索引" });
    expect(within(index).getByText("予約の期間を変更する")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "処理 × モジュール" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "F-01 の手順" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "関数 × 手順" })).toBeInTheDocument();
  });

  it("06 の「呼ばれる手順」を押すと、その処理のタブに切り替わる", async () => {
    const user = userEvent.setup();
    renderDemo();

    await user.click(screen.getByRole("tab", { name: "L-02 ReservationRepository.count_overlapping" }));
    await user.click(screen.getByRole("button", { name: "L-02 を呼ぶ手順 F-05#5 へ移る" }));

    expect(screen.getByRole("table", { name: "F-05 の手順" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "F-05 予約の期間を変更する" })).toHaveAttribute("aria-selected", "true");
  });

  it("06 はタブで1件だけ表示し、タブを押すと切り替わる", async () => {
    const user = userEvent.setup();
    renderDemo();

    expect(document.getElementById("dd-logic-L-01")).not.toBeNull();
    expect(document.getElementById("dd-logic-L-03")).toBeNull();

    await user.click(screen.getByRole("tab", { name: "L-03 Notifier.send" }));

    expect(document.getElementById("dd-logic-L-03")).not.toBeNull();
    expect(document.getElementById("dd-logic-L-01")).toBeNull();
  });

  it("手順の「詳細」バッジは、06 のタブをその関数に切り替える", async () => {
    const user = userEvent.setup();
    renderDemo();

    await user.click(screen.getByRole("button", { name: "F-01#4 の詳細 L-02 へ移る" }));

    expect(document.getElementById("dd-logic-L-02")).not.toBeNull();
    expect(screen.getByRole("tab", { name: "L-02 ReservationRepository.count_overlapping" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("逆引き表の L-ID を押すと、06 のタブがその関数に切り替わる", async () => {
    const user = userEvent.setup();
    renderDemo();

    const reverse = screen.getByRole("table", { name: "関数 × 手順" });
    await user.click(within(reverse).getByRole("button", { name: "L-03 へ移る" }));

    expect(document.getElementById("dd-logic-L-03")).not.toBeNull();
  });

  it("HTML と md をダウンロードできる", async () => {
    const save = vi.spyOn(download, "saveFile").mockImplementation(() => {});
    const user = userEvent.setup();
    renderDemo();

    await user.click(screen.getByRole("button", { name: "HTML をダウンロード" }));
    await user.click(screen.getByRole("button", { name: "md をダウンロード" }));

    expect(save).toHaveBeenNthCalledWith(1, "detailed-design-05-06.html", expect.stringContaining("<!doctype html>"), "text/html;charset=utf-8");
    expect(save).toHaveBeenNthCalledWith(2, "detailed-design-05-06.md", expect.stringContaining("## 5. 主要処理の手順"), "text/markdown;charset=utf-8");
    save.mockRestore();
  });

  it("md を表示できる", async () => {
    const user = userEvent.setup();
    renderDemo();

    await user.click(screen.getByRole("button", { name: "md を表示する" }));

    expect(screen.getByLabelText("05・06 章の md").textContent).toContain("## 6. 処理ロジックの詳細");
  });
});
