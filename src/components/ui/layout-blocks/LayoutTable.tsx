"use client";

import type { ReactNode } from "react";
import { memo } from "react";
import type { SizeTokens } from "tamagui";
import { Text, XStack, YStack, ScrollView } from "tamagui";

export type LayoutTableColumn<T> = {
  key: keyof T;
  header?: ReactNode;
  width?: number | SizeTokens;
  /** 指定時、セルの描画にこの関数を使う(値の表示専用整形など)。未指定時は既定のrenderCellValue。 */
  render?: (value: T[keyof T], row: T) => ReactNode;
};

export type LayoutTableProps<T extends Record<string, ReactNode>> = {
  data: T[];
  columns?: LayoutTableColumn<T>[];
  showHeader?: boolean;
  /** null/undefinedのセルに表示するプレースホルダー(既定値"-")。空文字列は対象外。 */
  emptyPlaceholder?: ReactNode;
  /** 指定時、ボディ行のみをこの高さで縦スクロール領域にし、ヘッダー行は常に表示したままにする */
  bodyMaxHeight?: number | SizeTokens;
  /** 指定時、テーブル本体をこの幅に固定し、外側を横スクロール可能なコンテナで包む */
  minWidth?: number;
  /** 指定時、行がクリック可能になる(カーソル・ホバー/プレス色の視覚フィードバック付き) */
  onRowClick?: (row: T, index: number) => void;
};

// TamaguiのView系コンポーネント(XStack/YStack)は素のテキストノードを直接の子に取れないため、
// 文字列/数値はここで必ず<Text>に包む。column.renderの戻り値も同じ制約を受けるため共有する。
function wrapPrimitive(value: ReactNode): ReactNode {
  return typeof value === "string" || typeof value === "number" ? <Text>{value}</Text> : value;
}

export function renderCellValue(value: ReactNode, emptyPlaceholder: ReactNode) {
  if (value === null || value === undefined) {
    return <Text color="$color9">{emptyPlaceholder}</Text>;
  }
  return wrapPrimitive(value);
}

function renderCell<T extends Record<string, ReactNode>>(
  column: LayoutTableColumn<T>,
  row: T,
  emptyPlaceholder: ReactNode,
) {
  return column.render
    ? wrapPrimitive(column.render(row[column.key], row))
    : renderCellValue(row[column.key], emptyPlaceholder);
}

function LayoutTableImpl<T extends Record<string, ReactNode>>({
  data,
  columns,
  showHeader = true,
  emptyPlaceholder = "-",
  bodyMaxHeight,
  minWidth,
  onRowClick,
}: LayoutTableProps<T>) {
  const resolvedColumns: LayoutTableColumn<T>[] =
    columns ??
    (data.length > 0
      ? (Object.keys(data[0]) as (keyof T)[]).map((key) => ({ key, header: String(key) }))
      : []);

  const headerRow = showHeader && resolvedColumns.length > 0 && (
    <XStack
      theme="green"
      backgroundColor="$color8"
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      {resolvedColumns.map((column) => (
        <XStack
          key={String(column.key)}
          width={column.width}
          flex={column.width ? undefined : 1}
          flexShrink={column.width ? 0 : undefined}
          padding="$1"
          $md={{ padding: "$3" }}
        >
          <Text  fontWeight="700">{column.header ?? String(column.key)}</Text>
        </XStack>
      ))}
    </XStack>
  );

  const bodyRows = data.map((row, rowIndex) => (
    <XStack
      key={rowIndex}
      borderBottomWidth={rowIndex === data.length - 1 ? 0 : 1}
      borderColor="$borderColor"
      backgroundColor={rowIndex % 2 === 0 ? "$background" : "$color2"}
      onPress={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
      hoverStyle={onRowClick ? { backgroundColor: "$color4" } : undefined}
      pressStyle={onRowClick ? { backgroundColor: "$color5" } : undefined}
      {...(onRowClick ? { cursor: "pointer" } : {})}
    >
      {resolvedColumns.map((column) => (
        <XStack
          key={String(column.key)}
          width={column.width}
          flex={column.width ? undefined : 1}
          flexShrink={column.width ? 0 : undefined}
          padding="$1"
          $md={{ padding: "$3" }}
          alignItems="center"
        >
          {renderCell(column, row, emptyPlaceholder)}
        </XStack>
      ))}
    </XStack>
  ));

  const table = (
    <YStack
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$4"
      overflow="hidden"
      width="100%"
      minWidth={minWidth}
      flexShrink={minWidth ? 0 : undefined}
    >
      {headerRow}
      <ScrollView maxHeight={bodyMaxHeight}>{bodyRows}</ScrollView>
    </YStack>
  );

  return minWidth ? (
    <XStack width="100%" overflowX="scroll" className="hide-scrollbar">
      {table}
    </XStack>
  ) : (
    table
  );
}

// ダイアログ開閉のような無関係なstate変更で384行規模のテーブルが再構築されるのを防ぐため
// memo化している(props(data/columns/onRowClick等)が参照的に安定していればスキップされる)。
// memo()はジェネリック関数コンポーネントの型シグネチャを消してしまうため、
// `as typeof LayoutTableImpl`でキャストして呼び出し側の型推論を保っている。
export const LayoutTable = memo(LayoutTableImpl) as typeof LayoutTableImpl;
