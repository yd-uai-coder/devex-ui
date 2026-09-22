"use client";

import { Card, styled, type GetProps } from "tamagui";

// アプリ共通のpadding・枠線を適用したカード(StatCard.tsxと同じ配色規則)
export const StyledCard = styled(Card, {
  name: "StyledCard",
  padding: "$4",
  gap: "$4",
  borderWidth: 1,
  borderColor: "$borderColor",
  backgroundColor: "$background",
  boxShadow: "$cardShadow",
});

export type StyledCardProps = GetProps<typeof StyledCard>;
