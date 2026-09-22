"use client";

import { useId } from "react";
import { Check as CheckIcon } from "lucide-react";
import type { SizeTokens, XStackProps } from "tamagui";
import { Checkbox, Label, XStack } from "tamagui";

export type CheckboxGroupOption = {
  value: string;
  label: string;
};

export type CheckboxGroupProps = Omit<XStackProps, "children"> & {
  items: CheckboxGroupOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  name?: string;
  size?: SizeTokens;
  disabled?: boolean;
};

// <Label>を持たない、チェックボックス一覧のみのコンポーネント(CheckboxGroupWithLabelから
// 分離)。DataFilterのように呼び出し側が既に別の場所でラベル相当の文言を表示しており、
// グループ自体のラベルが不要な場面でそのまま使える。グループ全体のラベルが必要な場合は
// CheckboxGroupWithLabelを使うこと。
export function CheckboxGroup({
  items,
  value = [],
  onValueChange,
  name,
  size,
  disabled = false,
  ...xstackProps
}: CheckboxGroupProps) {
  const groupId = useId();

  function toggle(itemValue: string, checked: boolean) {
    if (checked) {
      onValueChange?.([...value, itemValue]);
    } else {
      onValueChange?.(value.filter((v) => v !== itemValue));
    }
  }

  return (
    // PC(行並び)で親がflexアイテムになる場合、flex/minWidthで幅を明示的に確保しないと
    // flexWrapが機能する前提の「利用可能幅」自体が定まらず、チェックボックスが折り返さず
    // コンテナからはみ出す(RadioGroupWithLabelで踏んだのと同種のTamaguiのflex-shrink:0既定値問題)。
    <XStack alignItems="center" flexWrap="wrap" gap="$4" flexShrink={1} minWidth={0} {...xstackProps}>
      {items.map((item) => {
        const itemId = `${groupId}-${item.value}`;
        const checked = value.includes(item.value);
        return (
          <XStack key={item.value} alignItems="center" gap="$2">
            <Checkbox
              id={itemId}
              name={name}
              size={size}
              disabled={disabled}
              borderColor="$color7"
              checked={checked}
              onCheckedChange={(next) => toggle(item.value, next === true)}
            >
              <Checkbox.Indicator>
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox>
            <Label size={size} htmlFor={itemId} opacity={disabled ? 0.5 : 1}>
              {item.label}
            </Label>
          </XStack>
        );
      })}
    </XStack>
  );
}
