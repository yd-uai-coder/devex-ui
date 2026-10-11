import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import { ChatPageContent } from "../ChatPageContent";
import { ApiError } from "@/lib/api/client";
import { useHearingStore } from "@/features/hearing/hearing-store";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// ChatPanelはChatPanel.test.tsx、ポーリングの詳細な挙動はuseGenerationPolling.test.tsで
// 別途検証済みのため、ここではChatPageContent自身の配線(見出し・状態メッセージの出し分け・
// フックへ正しい引数を渡すか)だけを見る。
vi.mock("@/features/hearing/components/ChatPanel", () => ({
  ChatPanel: () => null,
}));

// 広い画面(lg)かどうかを切り替えるため、useMedia だけを差し替える
const mediaMock = vi.fn(() => ({ lg: false }));
vi.mock("tamagui", async () => {
  const actual = await vi.importActual<typeof import("tamagui")>("tamagui");
  return { ...actual, useMedia: () => mediaMock() };
});

const useGenerationPollingMock = vi.fn();
vi.mock("@/hooks/useGenerationPolling", () => ({
  useGenerationPolling: (...args: unknown[]) => useGenerationPollingMock(...args),
}));

function renderContent() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <ChatPageContent projectId="p1" />
    </TamaguiProvider>,
  );
}

describe("ChatPageContent", () => {
  beforeEach(() => {
    push.mockClear();
    useGenerationPollingMock.mockReset().mockReturnValue({ timedOut: false });
    useHearingStore.setState({ generationTriggered: false, projectStatus: null, points: null });
    mediaMock.mockReturnValue({ lg: false });
  });

  it("useGenerationPollingへprojectIdとgenerationTriggeredを渡す", () => {
    useHearingStore.setState({ generationTriggered: true });

    renderContent();

    expect(useGenerationPollingMock).toHaveBeenCalledWith("p1", true, expect.any(Function));
  });

  it("completed検知時のコールバックはドキュメント画面へ遷移する", () => {
    renderContent();

    const onCompleted = useGenerationPollingMock.mock.calls[0][2] as () => void;
    onCompleted();

    expect(push).toHaveBeenCalledWith("/projects/p1/documents");
  });

  it("generationTriggered中は生成中メッセージを表示する", () => {
    useHearingStore.setState({ generationTriggered: true });

    renderContent();

    expect(screen.getByText("設計書を生成しています。しばらくお待ちください...")).toBeInTheDocument();
  });

  it("timedOut=trueならタイムアウトメッセージを表示する", () => {
    useGenerationPollingMock.mockReturnValue({ timedOut: true });

    renderContent();

    expect(screen.getByRole("alert")).toHaveTextContent("生成に時間がかかっています");
  });

  it.each(["completed", "revising"] as const)(
    "projectStatus==='%s'なら生成済みドキュメントへの常設リンクを表示する(自動遷移はしない)",
    (projectStatus) => {
      useHearingStore.setState({ projectStatus });

      renderContent();

      expect(screen.getByRole("link", { name: /生成済みのドキュメントを見る/ })).toBeInTheDocument();
      expect(push).not.toHaveBeenCalled();
    },
  );

  it.each(["interviewing", "generating", null] as const)(
    "projectStatus==='%s'なら常設リンクを表示しない",
    (projectStatus) => {
      useHearingStore.setState({ projectStatus });

      renderContent();

      expect(screen.queryByRole("link", { name: /生成済みのドキュメントを見る/ })).not.toBeInTheDocument();
    },
  );

  const POINTS = {
    scale: null,
    legacy: false,
    stale: false,
    is_sufficient: false,
    points: [
      {
        key: "scale",
        kind: "function" as const,
        label: "規模",
        question: "使うのは誰ですか",
        required: true,
        status: "open" as const,
        summary: "",
        evidence: [],
      },
    ],
  };

  it("観点の表がまだ無ければ、パネルを出さない", () => {
    renderContent();

    expect(screen.queryByRole("table", { name: "観点の表" })).not.toBeInTheDocument();
  });

  it("狭い画面では観点の表を畳んで置く", () => {
    useHearingStore.setState({ points: POINTS });

    const { container } = renderContent();

    expect(screen.getByText("観点の表 ── 未決の必須 1 件: 規模")).toBeInTheDocument();
    expect(container.querySelector("details")?.open).toBe(false);
  });

  it("広い画面では観点の表を開いて置く", () => {
    mediaMock.mockReturnValue({ lg: true });
    useHearingStore.setState({ points: POINTS });

    const { container } = renderContent();

    expect(container.querySelector("details")?.open).toBe(true);
  });

  it("未決の必須の「対象外にする」で skipPoint を呼び、失敗したら理由を出す", async () => {
    const skipPoint = vi.fn().mockRejectedValueOnce(new ApiError(409, "未決の観点だけを対象外にできます"));
    useHearingStore.setState({ points: POINTS, skipPoint });
    const user = userEvent.setup();
    renderContent();

    await user.click(screen.getByRole("button", { name: "規模を対象外にする" }));

    expect(skipPoint).toHaveBeenCalledWith("p1", "scale");
    expect(await screen.findByRole("alert")).toHaveTextContent("未決の観点だけを対象外にできます");
  });

  it("生成中は「対象外にする」を出さない", () => {
    useHearingStore.setState({ points: POINTS, generationTriggered: true });
    renderContent();

    expect(screen.queryByRole("button", { name: "規模を対象外にする" })).not.toBeInTheDocument();
  });
});
