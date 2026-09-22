"use client";

import { TextArea, styled, type GetProps } from "tamagui";

// アプリ共通の枠線色を適用した複数行入力欄
export const StyledTextArea = styled(TextArea, {
  name: "StyledTextArea",
  borderColor: "$color7",
});

export type StyledTextAreaProps = GetProps<typeof StyledTextArea>;
