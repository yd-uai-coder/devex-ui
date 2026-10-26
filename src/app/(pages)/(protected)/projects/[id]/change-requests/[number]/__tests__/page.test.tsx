import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import ChangeRequestDetailPage from "../page";
import { useAuthStore } from "@/components/auth/auth-store";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/p1/change-requests/3",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/features/change-requests/components/ChangeRequestDetailContent", () => ({
  ChangeRequestDetailContent: ({
    projectId,
    number,
    initialTab,
    focusKey,
  }: {
    projectId: string;
    number: number;
    initialTab: string;
    focusKey: string | null;
  }) => (
    <div>
      change request {typeof number} {number} for {projectId} tab {initialTab} focus {String(focusKey)}
    </div>
  ),
}));

async function renderPage(searchParams: Record<string, string | string[] | undefined>) {
  const element = await ChangeRequestDetailPage({
    params: Promise.resolve({ id: "p1", number: "3" }),
    searchParams: Promise.resolve(searchParams),
  });
  render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {element}
    </TamaguiProvider>,
  );
}

describe("ChangeRequestDetailPage", () => {
  it("paramsのidと番号(数にして)をChangeRequestDetailContentへ渡し、RequireAuthでガードする", async () => {
    useAuthStore.setState({ accessToken: "header.payload.sig", status: "success", error: null });

    await renderPage({});

    expect(screen.getByText("change request number 3 for p1 tab content focus null")).toBeInTheDocument();
  });

  it("?tab=・?focus= を開くタブと目立たせる要素のキーとして渡す(知らないタブは内容)", async () => {
    useAuthStore.setState({ accessToken: "header.payload.sig", status: "success", error: null });

    await renderPage({ tab: "impact", focus: "req:FR-001" });
    expect(screen.getByText("change request number 3 for p1 tab impact focus req:FR-001")).toBeInTheDocument();
  });

  it("知らないタブ・複数の値は使わない", async () => {
    useAuthStore.setState({ accessToken: "header.payload.sig", status: "success", error: null });

    await renderPage({ tab: "unknown", focus: ["a", "b"] });
    expect(screen.getByText("change request number 3 for p1 tab content focus null")).toBeInTheDocument();
  });
});
