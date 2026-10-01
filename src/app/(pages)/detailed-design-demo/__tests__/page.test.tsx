import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DetailedDesignDemoPage from "../page";

vi.mock("@/features/detailed-design/demo/DetailedDesignDemoPageContent", () => ({
  DetailedDesignDemoPageContent: () => <div>detailed design demo</div>,
}));

describe("DetailedDesignDemoPage", () => {
  it("ログイン不要でデモの本体を表示する", () => {
    render(<DetailedDesignDemoPage />);

    expect(screen.getByText("detailed design demo")).toBeInTheDocument();
  });
});
