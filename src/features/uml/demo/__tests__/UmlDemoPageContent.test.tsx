import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import { UmlDemoPageContent } from "../UmlDemoPageContent";
import { useUmlEditorStore } from "@/features/uml/uml-editor-store";
import { useUmlStore } from "@/features/uml/uml-store";

vi.mock("next/navigation", () => ({
  usePathname: () => "/uml-demo",
  useRouter: () => ({ push: vi.fn() }),
}));

function renderDemo() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <UmlDemoPageContent />
    </TamaguiProvider>,
  );
}

describe("UmlDemoPageContent", () => {
  it("できること・できないことの一覧と、固定データの生成履歴・図を表示する", () => {
    renderDemo();

    expect(screen.getByText("現時点でできること・できないこと")).toBeInTheDocument();
    expect(screen.getByText(/draw.io \/ SVG の出力とダウンロード/)).toBeInTheDocument();
    expect(screen.getByText(/チャット送信: 未着手/)).toBeInTheDocument();
    expect(screen.getByText("認証ルート")).toBeInTheDocument();
  });

  it("記法を切り替えるとその図を表示する", async () => {
    const user = userEvent.setup();
    renderDemo();

    await user.click(screen.getByRole("button", { name: "ER図" }));

    expect(screen.getByText("generated_documents")).toBeInTheDocument();
  });

  it("生成と保存はサーバーへ送らず、送信内容を表示する", async () => {
    const user = userEvent.setup();
    renderDemo();

    await user.click(screen.getByRole("button", { name: "コンポーネント図を生成" }));
    useUmlEditorStore.getState().moveNodes({ c1: { x: 5, y: 5 } });
    await user.click(await screen.findByRole("button", { name: "保存" }));

    expect(screen.getByText("POST /diagrams(生成の指示)")).toBeInTheDocument();
    const saved = screen.getByText("PUT /diagrams/demo-component(保存)").parentElement!;
    expect(within(saved).getByText(/"version": 1/)).toBeInTheDocument();
    expect(useUmlEditorStore.getState().diagram?.version).toBe(2);
  });

  it("ページを離れるとストアのアクションを元に戻す", () => {
    const originalGenerate = useUmlStore.getState().generate;
    const originalSave = useUmlEditorStore.getState().save;

    const { unmount } = renderDemo();
    expect(useUmlStore.getState().generate).not.toBe(originalGenerate);
    unmount();

    expect(useUmlStore.getState().generate).toBe(originalGenerate);
    expect(useUmlEditorStore.getState().save).toBe(originalSave);
  });
});
