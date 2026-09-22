import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "../../../../tamagui.config";
import { DataFilter, applyDataFilter } from "./DataFilter";
import type { DataFilterFieldConfig, DataFilterValue } from "./DataFilter";

type Row = { name: string; price: number; category: string; colors: string };

const data: Row[] = [
  { name: "a", price: 1000, category: "tops", colors: "red" },
  { name: "b", price: 5000, category: "bottoms", colors: "blue" },
  { name: "c", price: 9000, category: "tops", colors: "green" },
];

describe("applyDataFilter", () => {
  it("returns all rows when value is null", () => {
    expect(applyDataFilter(data, null)).toEqual(data);
  });

  it("filters by range (min/max)", () => {
    const value: DataFilterValue<Row> = { key: "price", type: "range", min: 2000, max: 9500 };
    expect(applyDataFilter(data, value).map((r) => r.name)).toEqual(["b", "c"]);
  });

  it("filters by range with only min", () => {
    const value: DataFilterValue<Row> = { key: "price", type: "range", min: 5000 };
    expect(applyDataFilter(data, value).map((r) => r.name)).toEqual(["b", "c"]);
  });

  it("filters by select (exact match)", () => {
    const value: DataFilterValue<Row> = { key: "category", type: "select", value: "tops" };
    expect(applyDataFilter(data, value).map((r) => r.name)).toEqual(["a", "c"]);
  });

  it("filters by checkbox (any of selected values)", () => {
    const value: DataFilterValue<Row> = { key: "colors", type: "checkbox", values: ["red", "green"] };
    expect(applyDataFilter(data, value).map((r) => r.name)).toEqual(["a", "c"]);
  });

  it("treats an empty checkbox selection as no filter", () => {
    const value: DataFilterValue<Row> = { key: "colors", type: "checkbox", values: [] };
    expect(applyDataFilter(data, value)).toEqual(data);
  });
});

const fields: DataFilterFieldConfig<Row>[] = [
  { key: "price", label: "価格", type: "range" },
  { key: "category", label: "カテゴリ", type: "select", options: ["tops", "bottoms"] },
  { key: "colors", label: "色", type: "checkbox", options: ["red", "blue", "green"] },
];

function renderFilter(value: DataFilterValue<Row>, onChange: (v: DataFilterValue<Row>) => void) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <DataFilter fields={fields} value={value} onChange={onChange} />
    </TamaguiProvider>,
  );
}

describe("DataFilter component", () => {
  it("shows the range inputs for the default (first) field after opening the popover", async () => {
    const user = userEvent.setup();
    renderFilter(null, vi.fn());

    await user.click(screen.getByRole("button", { name: "絞り込み" }));

    expect(await screen.findByLabelText("下限")).toBeInTheDocument();
    expect(screen.getByLabelText("上限")).toBeInTheDocument();
  });

  it("does not call onChange while typing; only applies on the apply button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilter(null, onChange);

    await user.click(screen.getByRole("button", { name: "絞り込み" }));
    const lower = await screen.findByLabelText("下限");
    await user.type(lower, "1");

    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "適用" }));

    expect(onChange).toHaveBeenCalledWith({ key: "price", type: "range", min: 1, max: undefined });
  });

  it("closes the popover after applying", async () => {
    const user = userEvent.setup();
    renderFilter(null, vi.fn());

    await user.click(screen.getByRole("button", { name: "絞り込み" }));
    await user.type(await screen.findByLabelText("下限"), "1");
    await user.click(screen.getByRole("button", { name: "適用" }));

    expect(screen.queryByLabelText("下限")).not.toBeInTheDocument();
  });

  it("discards unapplied edits when the popover is reopened", async () => {
    const user = userEvent.setup();
    const value: DataFilterValue<Row> = { key: "price", type: "range", min: 100 };
    renderFilter(value, vi.fn());

    await user.click(screen.getByRole("button", { name: "絞り込み: 価格" }));
    const lower = await screen.findByLabelText("下限");
    expect(lower).toHaveValue(100);
    await user.clear(lower);
    await user.type(lower, "999");
    expect(lower).toHaveValue(999);

    // ポップオーバーの外をクリックして、適用せずに閉じる
    await user.click(document.body);
    expect(screen.queryByLabelText("下限")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "絞り込み: 価格" }));
    expect(await screen.findByLabelText("下限")).toHaveValue(100);
  });

  it("calls onChange(null) when the clear button is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value: DataFilterValue<Row> = { key: "price", type: "range", min: 100 };
    renderFilter(value, onChange);

    await user.click(screen.getByRole("button", { name: "絞り込み: 価格" }));
    await user.click(screen.getByRole("button", { name: "クリア" }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("switches the condition UI when a different key is selected", async () => {
    const user = userEvent.setup();
    renderFilter(null, vi.fn());

    await user.click(screen.getByRole("button", { name: "絞り込み" }));
    await screen.findByLabelText("下限");

    const keySelect = screen.getByLabelText("絞り込み");
    await user.click(keySelect);
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("カテゴリ"));

    expect(screen.queryByLabelText("下限")).not.toBeInTheDocument();
  });
});
