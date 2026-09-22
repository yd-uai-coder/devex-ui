"use client";

import { Card, H3, Text, XStack, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { Column } from "@/components/ui/primitives/Column";

const COLUMN_COUNT = 3;
const CARDS_PER_COLUMN = 3;

// Column自体はflexDirectionの切り替えを持たないビルディングブロックのため、
// 行コンテナ(XStack flexDirection="column" $md={{flexDirection:"row"}})は
// layout/grid/page.tsxの各セクション(YStack gap="$3"にH3+デモ本体)と同じ構成で
// ページ側に用意する。LayoutGridのgridCells(count)と同じく、.map()の結果を
// JSXのchildren位置に直接展開する(Columnはコンポーネント呼び出しではなく
// プレーンな関数として使う)。各カラムには3枚のカードを縦に並べ、ラベルは
// 「カラム番号-カード番号」(1-1, 1-2, 1-3, 2-1, ...)、色はカラム内でのカード
// インデックスの偶奇でgreen/blueを交互に切り替える(gridCellsの配色パターンを踏襲)。
function columnCards() {
  return Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => (
    <Column key={columnIndex}>
      {Array.from({ length: CARDS_PER_COLUMN }, (_, cardIndex) => (
        <Card
          key={cardIndex}
          theme={cardIndex % 2 === 0 ? "green" : "blue"}
          aspectRatio="1/1"
          backgroundColor="$color4"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$5"
          alignItems="center"
          justifyContent="center"
          width="100%"
          paddingVertical="$5"
        >
          <Text fontSize="$7" fontWeight="700" color="$color11">
            {`${columnIndex + 1}-${cardIndex + 1}`}
          </Text>
        </Card>
      ))}
    </Column>
  ));
}

export default function ColumnLayoutPage() {
  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="カラムレイアウト"
        description="PCでは複数カラム、モバイルでは1カラムに切り替わるカラムレイアウトのサンプルです。"
      />

      <YStack gap="$3">
        <H3>PC3カラム / モバイル1カラム(縦積み)</H3>
        <XStack flexDirection="column" $md={{ flexDirection: "row" }} gap="$4">
          {columnCards()}
        </XStack>
      </YStack>
    </YStack>
  );
}
