import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import NewProjectPage from "../page";
import { useAuthStore } from "@/components/auth/auth-store";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/new",
  useRouter: () => ({ push }),
}));

async function renderPage(query: { [key: string]: string | undefined }) {
  useAuthStore.setState({ accessToken: "header.payload.sig", status: "success", error: null });
  const element = await NewProjectPage({ searchParams: Promise.resolve(query) });
  render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {element}
    </TamaguiProvider>,
  );
}

describe("NewProjectPage", () => {
  it("ログイン済みで ?mode=simple ならヒアリング入力フォームを表示する", async () => {
    await renderPage({ mode: "simple" });

    expect(screen.getByRole("button", { name: "ヒアリングを始める" })).toBeInTheDocument();
    expect(screen.getByText("モード: 簡易ドキュメントモード")).toBeInTheDocument();
  });

  it.each([{}, { mode: "unknown" }])("mode が無い・不正(%o)ならモード選択ダイアログを出し、フォームを出さない", async (query) => {
    await renderPage(query);

    // Tamagui の Dialog は jsdom ではロールのクエリで隠れている扱いのため、文と aria-label で取る
    expect(screen.getByText("モードを選んでください")).toBeInTheDocument();
    expect(screen.getByLabelText("詳細設計モードで作成する")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ヒアリングを始める" })).toBeNull();
  });

  it("mode なしのダイアログでキャンセルするとダッシュボードへ戻る", async () => {
    push.mockClear();
    const user = userEvent.setup();
    await renderPage({});

    await user.click(screen.getByText("キャンセル"));

    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("?mode=detailed なら詳細設計モードで作成する", async () => {
    await renderPage({ mode: "detailed" });

    expect(screen.getByText("モード: 詳細設計モード")).toBeInTheDocument();
  });
});
