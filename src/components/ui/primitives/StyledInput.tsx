"use client";

import { Input, styled, type GetProps } from "tamagui";

// アプリ共通の枠線色を適用した入力欄
export const StyledInput = styled(Input, {
  name: "StyledInput",
  borderColor: "$color7",
});

export type StyledInputProps = GetProps<typeof StyledInput>;
