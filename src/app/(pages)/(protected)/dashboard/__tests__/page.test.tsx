import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import DashboardPage from "../page";
import { useAuthStore } from "@/components/auth/auth-store";
import { useDashboardStore } from "@/features/dashboard/dashboard-store";
import { stubFetch } from "@/lib/api/test-utils/fetch-stub";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push }),
}));

describe("DashboardPage", () => {
  let stub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    useAuthStore.setState({ accessToken: "header.payload.sig", status: "success", error: null });
    useDashboardStore.setState({ projects: [], status: "idle", error: null, fetchedAt: null });
    stub = stubFetch();
  });

  afterEach(() => {
    stub.restore();
  });

  it("ログイン済みならプロジェクト一覧を表示し、新規作成ボタンでモード選択ダイアログを開く", async () => {
    stub.queue({ status: 200, body: [] });
    const user = userEvent.setup();

    render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <DashboardPage />
      </TamaguiProvider>,
    );

    expect(await screen.findByText(/まだプロジェクトがありません/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "新規プロジェクトを作成" }));
    expect(await screen.findByText("モードを選んでください")).toBeInTheDocument();
  });
});
