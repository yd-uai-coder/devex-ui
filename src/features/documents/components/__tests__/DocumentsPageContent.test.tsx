import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import { DocumentsPageContent } from "../DocumentsPageContent";
import { useDocumentsStore } from "@/features/documents/documents-store";

const useGenerationPollingMock = vi.fn();
vi.mock("@/hooks/useGenerationPolling", () => ({
  POLL_INTERVAL_MS: 5000,
  useGenerationPolling: (...args: unknown[]) => useGenerationPollingMock(...args),
}));

// DocumentTabs自体はDocumentTabs.test.tsxで別途検証済みのため、ここでは
// DocumentsPageContent自身の配線(取得・再生成・状態表示の出し分け)だけを見る。
const tabsProps = vi.fn();
vi.mock("@/features/documents/components/DocumentTabs", () => ({
  DocumentTabs: (props: unknown) => {
    tabsProps(props);
    return null;
  },
}));

// レビューのパネル自体は ReviewPanel.test.tsx で検証済み。ここでは渡す区切り・対象から飛ぶ操作だけを見る
const panelProps = vi.fn();
vi.mock("@/features/design-review/components/ReviewPanel", () => ({
  ReviewPanel: (props: unknown) => {
    panelProps(props);
    return null;
  },
}));

function renderContent() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <DocumentsPageContent projectId="p1" />
    </TamaguiProvider>,
  );
}

describe("DocumentsPageContent", () => {
  beforeEach(() => {
    useGenerationPollingMock.mockReset().mockReturnValue({ timedOut: false });
    useDocumentsStore.setState({
      documents: [],
      status: "idle",
      error: null,
      fetchedAt: null,
      regenerating: false,
      regenerateError: null,
      projectMode: "simple",
      fetchDocuments: vi.fn().mockResolvedValue(undefined),
      fetchProjectMode: vi.fn().mockResolvedValue(undefined),
      regenerate: vi.fn().mockResolvedValue(undefined),
      onRegenerationCompleted: vi.fn(),
      progress: null,
      fetchProgress: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("マウント時にfetchDocuments(projectId)とfetchProjectMode(projectId)を呼ぶ", () => {
    renderContent();

    expect(useDocumentsStore.getState().fetchDocuments).toHaveBeenCalledWith("p1");
    expect(useDocumentsStore.getState().fetchProjectMode).toHaveBeenCalledWith("p1");
  });

  it("再生成ボタン押下で確認ダイアログを開き、確定するとregenerate(projectId)を呼ぶ", async () => {
    const user = userEvent.setup();
    renderContent();

    await user.click(screen.getByRole("button", { name: "再生成する" }));
    expect(useDocumentsStore.getState().regenerate).not.toHaveBeenCalled();
    // ダイアログ内のボタンは jsdom ではロールのクエリで「隠れている」扱いになるため、aria-label で取る
    await user.click(screen.getByLabelText("再生成する"));

    // 既定の起点は最初の文書(全部を作り直す。起点は送らない)
    expect(useDocumentsStore.getState().regenerate).toHaveBeenCalledWith("p1", undefined);
  });

  it("再生成の起点を選ぶと、その文書から下流を作り直す", async () => {
    const user = userEvent.setup();
    renderContent();

    await user.click(screen.getByRole("button", { name: "再生成する" }));
    expect(screen.getByText("(内部設計・実装計画)")).toBeInTheDocument();
    await user.click(screen.getByLabelText(/内部設計以降を再生成/));
    await user.click(screen.getByLabelText("再生成する"));

    expect(useDocumentsStore.getState().regenerate).toHaveBeenCalledWith("p1", "internal_design");
  });

  it("再生成中は文書ごとの進み具合を出し、取り直す", () => {
    useDocumentsStore.setState({
      regenerating: true,
      progress: { targets: ["external_design", "internal_design", "implementation_plan"], done: ["external_design"], current: "internal_design" },
    });
    renderContent();

    expect(useDocumentsStore.getState().fetchProgress).toHaveBeenCalledWith("p1");
    expect(screen.getByLabelText("再生成の進み具合")).toHaveTextContent(
      "要件定義：対象外 外部設計：生成完了 内部設計：生成中 実装計画：待ち",
    );
  });

  it("再生成の受け付けの失敗を表示する", () => {
    useDocumentsStore.setState({ regenerateError: "設計書を生成しています。" });

    renderContent();

    expect(screen.getByRole("alert")).toHaveTextContent("設計書を生成しています。");
  });

  it("useGenerationPollingへregeneratingを渡し、完了時にonRegenerationCompletedを呼ぶ", () => {
    useDocumentsStore.setState({ regenerating: true });

    renderContent();

    expect(useGenerationPollingMock).toHaveBeenCalledWith("p1", true, expect.any(Function));
    const onCompleted = useGenerationPollingMock.mock.calls[0][2] as () => void;
    onCompleted();
    expect(useDocumentsStore.getState().onRegenerationCompleted).toHaveBeenCalledWith("p1");
  });

  it("簡易ドキュメントモードでは、詳細設計へ進むリンクを出さない", () => {
    useDocumentsStore.setState({ projectMode: "simple" });

    renderContent();

    expect(screen.queryByRole("link", { name: "詳細設計へ進む →" })).not.toBeInTheDocument();
  });

  it("詳細設計モードでは、詳細設計へ進むリンクを表示する", () => {
    useDocumentsStore.setState({ projectMode: "detailed" });

    renderContent();

    expect(screen.getByRole("link", { name: "詳細設計へ進む →" })).toHaveAttribute(
      "href",
      "/projects/p1/detailed-design",
    );
  });

  it("ドキュメントが無ければ空状態メッセージを表示する", () => {
    useDocumentsStore.setState({ status: "success", documents: [] });

    renderContent();

    expect(screen.getByText("まだ生成されたドキュメントがありません。")).toBeInTheDocument();
  });

  it("簡易ドキュメントモードでは、実装手順書へ進むリンクを表示する(同じ詳細設計画面を段階8だけで開く)", () => {
    useDocumentsStore.setState({ projectMode: "simple" });

    renderContent();

    expect(screen.getByRole("link", { name: "実装手順書へ進む →" })).toHaveAttribute(
      "href",
      "/projects/p1/detailed-design",
    );
  });

  it("レビューのパネルに文書の区切りを渡し、指摘の対象から文書のタブへ移る", () => {
    useDocumentsStore.setState({
      documents: [
        { id: "d1", doc_type: "requirements", content: "#", version: 2, created_at: "", is_current: true },
        { id: "d2", doc_type: "external_design", content: "#", version: 1, created_at: "", is_current: true },
      ],
      status: "success",
    });
    renderContent();

    const props = panelProps.mock.lastCall?.[0] as {
      gates: string[];
      refreshKey: string;
      targetAction: (target: string) => { onPress: () => void } | null;
    };
    expect(props.gates).toEqual(["documents"]);
    expect(props.refreshKey).toBe("requirements:2,external_design:1");
    // 無い文書・推定できない対象は押せない
    expect(props.targetAction("DF-1")).toBeNull();
    expect(props.targetAction("観点 セキュリティ")).toBeNull();
    act(() => props.targetAction("SCR-004")?.onPress());
    expect(tabsProps.mock.lastCall?.[0]).toMatchObject({ activeType: "external_design" });
  });

  it("待つ時間の上限を過ぎたら、再生成中の文の代わりに読み込み直しを促す", () => {
    useGenerationPollingMock.mockReturnValue({ timedOut: true });
    useDocumentsStore.setState({ regenerating: true });
    renderContent();

    expect(screen.getByRole("alert")).toHaveTextContent("再生成に時間がかかっています");
    expect(screen.queryByText("再生成しています。しばらくお待ちください...")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再生成中..." })).toHaveAttribute("aria-disabled", "true");
  });
});
