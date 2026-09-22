"use client";

import { XStack } from "tamagui";
import SelectGroupWithLabel from "@/components/ui/form/SelectGroupWithLabel";

export type DataSortFieldConfig<T> = { key: keyof T; label: string };
export type DataSortValue<T> = { key: keyof T; direction: "asc" | "desc" } | null;

const NO_SORT_VALUE = "__none__";

// 元配列は変更せずコピーしてソートする。両辺がnumberなら数値比較、そうでなければ
// 日本語の文言を扱う既存箇所(toLocaleString("ja-JP"))と方針を揃えてlocaleCompareで比較する。
export function applyDataSort<T>(data: T[], value: DataSortValue<T>): T[] {
  if (!value) return data;
  const { key, direction } = value;
  return [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "ja");
    return direction === "asc" ? cmp : -cmp;
  });
}

type DataSortProps<T> = {
  fields: DataSortFieldConfig<T>[];
  value: DataSortValue<T>;
  onChange: (value: DataSortValue<T>) => void;
};

export function DataSort<T>({ fields, value, onChange }: DataSortProps<T>) {
  const keyItems = [
    { value: NO_SORT_VALUE, label: "並び替えなし" },
    ...fields.map((field) => ({ value: String(field.key), label: field.label })),
  ];
  const directionItems = [
    { value: "asc", label: "昇順" },
    { value: "desc", label: "降順" },
  ];

  function handleKeyChange(nextKey: string) {
    if (nextKey === NO_SORT_VALUE) {
      onChange(null);
      return;
    }
    const field = fields.find((f) => String(f.key) === nextKey);
    if (!field) return;
    onChange({ key: field.key, direction: value?.direction ?? "asc" });
  }

  function handleDirectionChange(nextDirection: string) {
    if (!value) return;
    onChange({ key: value.key, direction: nextDirection === "desc" ? "desc" : "asc" });
  }

  return (
    <XStack gap="$3" flexWrap="wrap" alignItems="flex-end" >
      <SelectGroupWithLabel
        label="並び替え"
        items={keyItems}
        value={value ? String(value.key) : NO_SORT_VALUE}
        onValueChange={handleKeyChange}
        renderValue={(v) => keyItems.find((item) => item.value === v)?.label}
        width={220}
      />
      <SelectGroupWithLabel
        label="順序"
        items={directionItems}
        value={value?.direction ?? "asc"}
        onValueChange={handleDirectionChange}
        renderValue={(v) => directionItems.find((item) => item.value === v)?.label}
        width={160}
        status={value ? "default" : "disabled"}
      />
    </XStack>
  );
}
