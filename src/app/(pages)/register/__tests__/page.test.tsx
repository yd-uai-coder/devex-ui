import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import RegisterPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function renderPage() {
  render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <RegisterPage />
    </TamaguiProvider>,
  );
}

describe("RegisterPage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("登録フォームとログイン画面へのリンクを表示する", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "");
    renderPage();

    expect(screen.getByRole("button", { name: "登録する" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "こちらからログイン" })).toHaveAttribute("href", "/login");
  });

  it("Google のボタンを出せる環境では、フォームの下に「または」と Google のボタンを出す", () => {
    vi.stubEnv("NEXT_PUBLIC_E2E_FAKE_GOOGLE", "true");
    renderPage();

    expect(screen.getByRole("button", { name: "登録する" })).toBeInTheDocument();
    expect(screen.getByText("または")).toBeInTheDocument();
    expect(screen.getByLabelText("Google で続ける(E2E)")).toBeInTheDocument();
  });

  it("クライアント ID が無ければ Google の部分を出さない", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "");
    renderPage();

    expect(screen.queryByText("または")).not.toBeInTheDocument();
  });
});
