"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { H3, Text, XStack, YStack, Circle } from "tamagui";
import styles from "./ListCard.module.css";
import { StyledCard } from "@/components/ui/primitives/StyledCard";

// 文字列単体ならリンク無し、{ label, href }ならリンク付き。同じ配列内に両方を混在でき、
// リンクを付けるかどうかは呼び出し側が要素ごとに決められる。
export type ListCardItem = string | { label: string; href: string };

export type ListCardColumns = {
  /** モバイル(768px未満)での列数。既定1 */
  base?: number;
  /** PC(768px以上、Tamaguiの$mdと同じ768px)での列数。既定2 */
  md?: number;
};

export type ListCardProps = {
  title?: string;
  /** タイトルの色(Tamaguiのcolorトークン、または生のCSSカラー文字列)。既定は未指定(Tamagui既定色) */
  titleColor?: string;
  list: ListCardItem[];
  columns?: ListCardColumns;
};

// 文字列/オブジェクト形式のいずれの項目もlabel・hrefに正規化する
function resolveItem(item: ListCardItem): { label: string; href?: string } {
  return typeof item === "string" ? { label: item } : item;
}

// タイトル付きの列挙リストをグリッド表示するカード
export function ListCard({ title, titleColor, list, columns }: ListCardProps) {
  const mobileColumns = columns?.base ?? 1;
  const desktopColumns = columns?.md ?? 2;

  return (
    <StyledCard margin="auto" minWidth={400} paddingVertical="$4" gap="$1">
      {title ? (
        <H3 paddingLeft="$6" color={titleColor}>
          {title}
        </H3>
      ) : null}
      <YStack
        paddingTop="$2"
        paddingHorizontal="$4"
        gap="$4"
        className={styles.grid}
        style={
          {
            "--list-card-mobile-columns": mobileColumns,
            "--list-card-desktop-columns": desktopColumns,
          } as CSSProperties
        }
      >
        {/* 各項目をリンク有無に応じて描画 */}
        {list.map((item, index) => {
          const { label, href } = resolveItem(item);
          return href ? (
            <XStack key={index} alignItems="center">
              <Circle size={8} backgroundColor="$neutral9" marginRight="$2" />
              <Link href={href}>
                <Text>{label}</Text>
              </Link>
            </XStack>
          ) : (
            <Text key={index}>{label}</Text>
          );
        })}
      </YStack>
    </StyledCard>
  );
}
