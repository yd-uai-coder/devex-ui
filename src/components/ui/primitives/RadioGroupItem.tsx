"use client";

import type { RadioGroupItemProps as TamaguiRadioGroupItemProps, SizeTokens } from "tamagui";
import { RadioGroup } from "tamagui";

function getOneSizeSmaller(size?: SizeTokens): SizeTokens {
  const normalized = String(size === undefined || size === "$true" ? "$4" : size);
  const match = /^\$(\d+(?:\.\d+)?)$/.exec(normalized);
  if (!match) return normalized as SizeTokens;
  const next = Math.max(0, Number(match[1]) - 2);
  return `$${next}` as SizeTokens;
}

export type RadioGroupItemProps = Omit<TamaguiRadioGroupItemProps, "size"> & {
  // ラジオボタンと並べて表示するテキストのサイズ。ボタン自体はこれより常に1段階小さいサイズになる。
  textSize?: SizeTokens;
};

export function RadioGroupItem({ textSize, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroup.Item
      size={getOneSizeSmaller(textSize)}
      borderColor="$color7"
      hoverStyle={{ borderColor: "$color7" }}
      focusStyle={{ borderColor: "$color7" }}
      pressStyle={{ borderColor: "$color7" }}
      {...props}
    >
      <RadioGroup.Indicator />
    </RadioGroup.Item>
  );
}
