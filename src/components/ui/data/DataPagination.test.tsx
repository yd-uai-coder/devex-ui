import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "../../../../tamagui.config";
import { DataPagination, paginateData } from "./DataPagination";

describe("paginateData", () => {
  const data = Array.from({ length: 25 }, (_, i) => i + 1);

  it("returns the first page", () => {
    expect(paginateData(data, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("returns a middle page", () => {
    expect(paginateData(data, 2, 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it("returns a partial final page", () => {
    expect(paginateData(data, 3, 10)).toEqual([21, 22, 23, 24, 25]);
  });

  it("returns an empty array for a page beyond range", () => {
    expect(paginateData(data, 4, 10)).toEqual([]);
  });
});

function renderPagination(
  props: Partial<{ page: number; pageCount: number; totalCount: number; onPageChange: (page: number) => void }> = {},
) {
  const onPageChange = props.onPageChange ?? vi.fn();
  render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <DataPagination
        page={props.page ?? 2}
        pageCount={props.pageCount ?? 5}
        totalCount={props.totalCount ?? 45}
        onPageChange={onPageChange}
      />
    </TamaguiProvider>,
  );
  return onPageChange;
}

describe("DataPagination component", () => {
  it("shows the page/count label", () => {
    renderPagination({ page: 2, pageCount: 5, totalCount: 45 });
    expect(screen.getByText("2 / 5 ページ(全45件)")).toBeInTheDocument();
  });

  // TamaguiのButtonのdisabledはネイティブHTML属性ではなくaria-disabledで実装されている
  // (pointerEvents:'none'併用、CLAUDE.md記載の既知事項)ため、toBeDisabled()ではなく
  // aria-disabled属性を直接確認する。
  it("disables the previous button on the first page", () => {
    renderPagination({ page: 1, pageCount: 5 });
    expect(screen.getByRole("button", { name: "前へ" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "次へ" })).not.toHaveAttribute("aria-disabled", "true");
  });

  it("disables the next button on the last page", () => {
    renderPagination({ page: 5, pageCount: 5 });
    expect(screen.getByRole("button", { name: "次へ" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "前へ" })).not.toHaveAttribute("aria-disabled", "true");
  });

  it("calls onPageChange with page - 1 / page + 1", async () => {
    const user = userEvent.setup();
    const onPageChange = renderPagination({ page: 3, pageCount: 5 });

    await user.click(screen.getByRole("button", { name: "前へ" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);

    await user.click(screen.getByRole("button", { name: "次へ" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });
});
