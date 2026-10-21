// SUT: ChangeRequestsPageContent(一覧の画面)と、その中の ChangeRequestList・StatusBadge・DetailedModeOnlyNotice
// ドライバ: Testing Library(描画)
// スタブ: ストアの取得の関数(vi.fn)── 画面の配線(読み込み・リンク・作成は束の中身から、と知らせる・
// 簡易モードの知らせ)だけを見るため。ストア自体は store のテストで確かめる
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import { ChangeRequestsPageContent } from "../ChangeRequestsPageContent";
import { useChangeRequestsStore } from "../../change-requests-store";
import { makeChangeRequest } from "../../test-utils/changeRequestFixtures";

function renderContent() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <ChangeRequestsPageContent projectId="p1" />
    </TamaguiProvider>,
  );
}

describe("ChangeRequestsPageContent", () => {
  beforeEach(() => {
    useChangeRequestsStore.setState({
      projectId: "p1",
      list: [],
      status: "success",
      error: null,
      notFound: false,
      unavailable: false,
      fetchList: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("開くと一覧を読み、一覧の行から詳細と基準の版へのリンクと状態を出す", () => {
    useChangeRequestsStore.setState({ list: [makeChangeRequest({ status: "agreed", status_label: "合意" })] });

    renderContent();

    expect(useChangeRequestsStore.getState().fetchList).toHaveBeenCalledWith("p1");
    expect(screen.getByRole("link", { name: "CR-1" })).toHaveAttribute("href", "/projects/p1/change-requests/1");
    expect(screen.getByRole("link", { name: "B-1" })).toHaveAttribute("href", "/projects/p1/baselines/1");
    expect(screen.getByLabelText("状態: 合意")).toBeInTheDocument();
    expect(screen.getByText("FR-005(内容の変更)")).toBeInTheDocument();
  });

  it("作成のボタンは置かず、作成は合意済みの版の中身から、と束の一覧へのリンクを出す", () => {
    renderContent();

    expect(screen.queryByRole("button", { name: "変更要求を作る" })).not.toBeInTheDocument();
    expect(screen.getByText(/の中身のページから作ります/)).toBeInTheDocument();
    // 見出しと案内の文の2つ
    const links = screen.getAllByRole("link", { name: "合意済みの版" });
    expect(links).toHaveLength(2);
    expect(links[1]).toHaveAttribute("href", "/projects/p1/baselines");
    expect(screen.getByRole("link", { name: "確認事項" })).toHaveAttribute("href", "/projects/p1/confirmations");
    expect(screen.getByText("変更要求はまだありません。")).toBeInTheDocument();
  });

  it("プロジェクトが無ければ知らせだけを出す", () => {
    useChangeRequestsStore.setState({ notFound: true });

    renderContent();

    expect(screen.getByText("このプロジェクトは見つかりません")).toBeInTheDocument();
  });

  it("簡易モードのプロジェクトでは、詳細設計モードだけと知らせる", () => {
    useChangeRequestsStore.setState({ unavailable: true });

    renderContent();

    expect(screen.getByText(/詳細設計モードのプロジェクトだけで使えます/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ドキュメントへ戻る →" })).toHaveAttribute("href", "/projects/p1/documents");
    expect(screen.queryByText("変更要求はまだありません。")).not.toBeInTheDocument();
  });
});
