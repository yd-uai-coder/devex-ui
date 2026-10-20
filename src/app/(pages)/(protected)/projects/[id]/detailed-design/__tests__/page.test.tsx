import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import DetailedDesignPage from "../page";
import { useAuthStore } from "@/components/auth/auth-store";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/p1/detailed-design",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock(
  "@/features/detailed-design/components/DetailedDesignPageContent",
  () => ({
    DetailedDesignPageContent: ({ projectId, initialStage }: { projectId: string; initialStage?: number }) => (
      <div>
        detailed design for {projectId} at {initialStage ?? "none"}
      </div>
    ),
  }),
);

describe("DetailedDesignPage", () => {
  it("paramsのidをDetailedDesignPageContentへ渡し、RequireAuthでガードする", async () => {
    useAuthStore.setState({
      accessToken: "header.payload.sig",
      status: "success",
      error: null,
    });

    const element = await DetailedDesignPage({
      params: Promise.resolve({ id: "p1" }),
      searchParams: Promise.resolve({}),
    });

    render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        {element}
      </TamaguiProvider>,
    );

    expect(screen.getByText("detailed design for p1 at none")).toBeInTheDocument();
  });

  it("?stage=N を開く段階として渡す(段階で無い値は渡さない)", async () => {
    useAuthStore.setState({ accessToken: "header.payload.sig", status: "success", error: null });

    const element = await DetailedDesignPage({
      params: Promise.resolve({ id: "p1" }),
      searchParams: Promise.resolve({ stage: "3" }),
    });
    const ignored = await DetailedDesignPage({
      params: Promise.resolve({ id: "p1" }),
      searchParams: Promise.resolve({ stage: "9" }),
    });

    expect((element.props as { children: { props: { initialStage?: number } } }).children.props.initialStage).toBe(3);
    expect((ignored.props as { children: { props: { initialStage?: number } } }).children.props.initialStage).toBeUndefined();
  });
});
