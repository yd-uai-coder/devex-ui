"use client";

import type { ReactNode } from "react";
import { YStack, XStack } from "tamagui";

// フィールド定義を「書く」時に使う型安全な形。Vはフィールドごとに文字列/配列/真偽値など
// 異なりうる。
export type DataFilterMultipleField<T, V> = {
  /** valueオブジェクト内でこのフィールドの値を保持するキー。フィールド間で一意にする */
  id: string;
  label: string;
  initialValue: V;
  /** このフィールドの値がrowに一致するか。値がinitialValue(絞り込み無し)の時もtrueを返す実装にする */
  match: (row: T, value: V) => boolean;
  /** フィールドの入力UIを描画する。内部にuseStateを持つ自己完結したコンポーネントを返して構わない */
  render: (value: V, onChange: (value: V) => void) => ReactNode;
};

// フィールドごとに異なるVを持つDataFilterMultipleFieldを1配列にまとめて扱うための、
// Vを消去した形。DataFilterMultiple/applyDataFilterMultipleはこちらの形で受け取る。
export type DataFilterMultipleFieldConfig<T> = {
  id: string;
  label: string;
  initialValue: unknown;
  match: (row: T, value: unknown) => boolean;
  render: (value: unknown, onChange: (value: unknown) => void) => ReactNode;
};

// 型付きフィールド定義を配列格納用に型消去して返す
export function defineDataFilterMultipleField<T, V>(
  field: DataFilterMultipleField<T, V>,
): DataFilterMultipleFieldConfig<T> {
  return field as unknown as DataFilterMultipleFieldConfig<T>;
}

export type DataFilterMultipleValue = Record<string, unknown>;

// 登録済み全フィールドの条件をAND結合して行を絞り込む
export function applyDataFilterMultiple<T>(
  data: T[],
  fields: DataFilterMultipleFieldConfig<T>[],
  value: DataFilterMultipleValue,
): T[] {
  return data.filter((row) =>
    fields.every((field) => field.match(row, value[field.id] ?? field.initialValue)),
  );
}

export type DataFilterMultipleProps<T> = {
  fields: DataFilterMultipleFieldConfig<T>[];
  value: DataFilterMultipleValue;
  onChange: (value: DataFilterMultipleValue) => void;
};

// 複数フィールドの条件入力を即時反映で並べて表示する
export function DataFilterMultiple<T>({ fields, value, onChange }: DataFilterMultipleProps<T>) {
  return (
    <XStack gap="$2" flexWrap="wrap">
      {/* フィールドごとに入力UIを描画する */}
      {fields.map((field) => (
        <YStack
          key={field.id}
          flexBasis="100%"
          $md={{
            paddingHorizontal: "16px",
            flexBasis: "calc(50% - 8px)" as "50%",
          }}
        >
          {field.render(value[field.id] ?? field.initialValue, (next) =>
            onChange({ ...value, [field.id]: next }),
          )}
        </YStack>
      ))}
    </XStack>
  );
}
