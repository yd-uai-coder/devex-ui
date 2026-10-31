import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home, { metadata } from "../page";

vi.mock("@/features/top/components/TopPageContent", () => ({
  TopPageContent: () => <div>top content</div>,
}));

describe("Home(トップページ)", () => {
  it("ログインを求めずに TOP の本文を出し、題と説明を持つ", () => {
    render(<Home />);

    expect(screen.getByText("top content")).toBeInTheDocument();
    expect(String(metadata.title)).toContain("Devex");
    expect(metadata.description).toContain("合意");
  });
});
