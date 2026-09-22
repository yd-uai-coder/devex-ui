"use client";

import { useState } from "react";
import { XStack, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { LayoutTable } from "@/components/ui/layout-blocks/LayoutTable";
import type { LayoutTableColumn } from "@/components/ui/layout-blocks/LayoutTable";
import InputNumber from "@/components/ui/form/InputNumber";

const MIN_COUNT = 1;
const MAX_COUNT = 10;
const DEFAULT_COUNT = 3;

// 入力欄はユーザーが打った生の文字列(rowCountText/columnCountText)をそのまま表示する。
// クランプ後の値をvalueへ書き戻すと、入力欄をクリアした瞬間に強制的に既定値へ戻ってしまい
// 2桁の数値(10など)を自由に打ち直せなくなるため、テーブル生成に使う数値は別途この関数で
// 導出する(表示用の生テキストとは分離する)。
function clamp(text: string) {
  const value = Number(text);
  if (!Number.isFinite(value)) return DEFAULT_COUNT;
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.trunc(value)));
}

type TableRow = Record<string, string>;

export default function LayoutTablePage() {
  const [rowCountText, setRowCountText] = useState(String(DEFAULT_COUNT));
  const [columnCountText, setColumnCountText] = useState(String(DEFAULT_COUNT));

  const rowCount = clamp(rowCountText);
  const columnCount = clamp(columnCountText);

  const columns: LayoutTableColumn<TableRow>[] = Array.from({ length: columnCount }, (_, i) => {
    const columnNum = i + 1;
    return { key: `col${columnNum}`, header: `column-${columnNum}` };
  });

  const data: TableRow[] = Array.from({ length: rowCount }, (_, r) => {
    const rowNum = r + 1;
    const row: TableRow = {};
    for (let c = 1; c <= columnCount; c++) {
      row[`col${c}`] = `${c}-${rowNum}`;
    }
    return row;
  });

  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="Tableレイアウト"
        description="行数・列数を指定すると表が動的に生成されるテーブルレイアウトのサンプルです。"
      />

      <XStack gap="$4" flexWrap="wrap">
        <InputNumber
          label="行数"
          value={rowCountText}
          onChangeText={setRowCountText}
          min={MIN_COUNT}
          max={MAX_COUNT}
          width={200}
        />
        <InputNumber
          label="列数"
          value={columnCountText}
          onChangeText={setColumnCountText}
          min={MIN_COUNT}
          max={MAX_COUNT}
          width={200}
        />
      </XStack>

      <LayoutTable data={data} columns={columns} />
    </YStack>
  );
}
