"use client";

import { Card, H3, Text, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { LayoutGrid } from "@/components/ui/layout-blocks/LayoutGrid";

// LayoutGridが提供するアスペクト比ラッパーいっぱいに広がるよう、Cardにwidth/height100%を指定している。
// コンポーネント(<GridCells />)として呼ぶのではなく配列を返すプレーンな関数にしている点に注意:
// LayoutGridはChildren.toArray(children)で直接の子要素数を数えるため、コンポーネント呼び出し
// (<GridCells count={10} />)にすると「展開前の1要素」としてしか見えず10枚のCardとして
// 認識されない。.map()の結果をJSXのchildren位置に直接並べるLayoutCarouselページの
// (SLIDE_THEMES.map(...))と同じパターンにする必要がある。
function gridCells(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <Card
      key={index}
      theme={index % 2 === 0 ? "green" : "blue"}
      backgroundColor="$color4"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$5"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
    >
      <Text fontSize="$7" fontWeight="700" color="$color11">
        {index + 1}
      </Text>
    </Card>
  ));
}

export default function LayoutPage() {
  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="Gridレイアウト"
        description="列数・アスペクト比を指定できるグリッドレイアウトのサンプルです。"
      />

      <YStack gap="$3">
        <H3>モバイル2列 / PC4列(既定)・アスペクト比1:1</H3>
        <LayoutGrid>{gridCells(10)}</LayoutGrid>
      </YStack>

      <YStack gap="$3">
        <H3>モバイル2列 / PC3列・アスペクト比4:5</H3>
        <LayoutGrid columns={{ base: 2, md: 3 }} aspectRatio={4 / 5}>
          {gridCells(10)}
        </LayoutGrid>
      </YStack>

      <YStack gap="$3">
        <H3>モバイル3列 / PC5列・アスペクト比3:2</H3>
        <LayoutGrid columns={{ base: 3, md: 5 }} aspectRatio={3 / 2}>
          {gridCells(10)}
        </LayoutGrid>
      </YStack>

      <YStack gap="$3">
        <H3>モバイル4列 / PC4列・アスペクト比3:2</H3>
        <LayoutGrid columns={{ base: 4, md: 4 }} aspectRatio={3 / 2}>
          {gridCells(10)}
        </LayoutGrid>
      </YStack>
    </YStack>
  );
}
