import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import { ChatPageContent } from "../ChatPageContent";
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
    useHearingStore.setState({ generationTriggered: false, projectStatus: null });
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
});
