import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "../../../../tamagui.config";
import { DataSort, applyDataSort } from "./DataSort";
import type { DataSortFieldConfig, DataSortValue } from "./DataSort";

type Row = { name: string; price: number };

const data: Row[] = [
  { name: "banana", price: 300 },
  { name: "apple", price: 100 },
  { name: "cherry", price: 200 },
];

describe("applyDataSort", () => {
  it("returns the same order when value is null", () => {
    expect(applyDataSort(data, null)).toEqual(data);
  });

  it("sorts numbers ascending/descending", () => {
    expect(applyDataSort(data, { key: "price", direction: "asc" }).map((r) => r.price)).toEqual([
      100, 200, 300,
    ]);
    expect(applyDataSort(data, { key: "price", direction: "desc" }).map((r) => r.price)).toEqual([
      300, 200, 100,
    ]);
  });

  it("sorts strings ascending/descending using locale compare", () => {
    expect(applyDataSort(data, { key: "name", direction: "asc" }).map((r) => r.name)).toEqual([
      "apple",
      "banana",
      "cherry",
    ]);
    expect(applyDataSort(data, { key: "name", direction: "desc" }).map((r) => r.name)).toEqual([
      "cherry",
      "banana",
      "apple",
    ]);
  });

  it("does not mutate the original array", () => {
    const original = [...data];
    applyDataSort(data, { key: "price", direction: "asc" });
    expect(data).toEqual(original);
  });
});

const fields: DataSortFieldConfig<Row>[] = [
  { key: "name", label: "名前" },
  { key: "price", label: "価格" },
];

function renderSort(value: DataSortValue<Row>, onChange: (v: DataSortValue<Row>) => void) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <DataSort fields={fields} value={value} onChange={onChange} />
    </TamaguiProvider>,
  );
}

describe("DataSort component", () => {
  it("calls onChange with the selected key and default asc direction", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSort(null, onChange);

    await user.click(screen.getByLabelText("並び替え"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("価格"));

    expect(onChange).toHaveBeenCalledWith({ key: "price", direction: "asc" });
  });

  it("calls onChange(null) when 並び替えなし is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSort({ key: "price", direction: "asc" }, onChange);

    await user.click(screen.getByLabelText("並び替え"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("並び替えなし"));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("calls onChange with the new direction while keeping the same key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSort({ key: "price", direction: "asc" }, onChange);

    await user.click(screen.getByLabelText("順序"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("降順"));

    expect(onChange).toHaveBeenCalledWith({ key: "price", direction: "desc" });
  });
});
