import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UmlDemoPage from "../page";

vi.mock("@/features/uml/demo/UmlDemoPageContent", () => ({
  UmlDemoPageContent: () => <div>uml demo</div>,
}));

describe("UmlDemoPage", () => {
  it("ログイン不要でデモの本体を表示する", () => {
    render(<UmlDemoPage />);

    expect(screen.getByText("uml demo")).toBeInTheDocument();
  });
});
