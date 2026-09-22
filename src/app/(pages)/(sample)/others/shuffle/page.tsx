"use client";

import { Card, H3, Text, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { LayoutGrid } from "@/components/ui/layout-blocks/LayoutGrid";
import { StyledButton } from "@/components/ui/primitives/StyledButton";
import { useShuffle } from "@/hooks/useShuffle";

const SAMPLE_ITEMS = ["sample_1", "sample_2", "sample_3", "sample_4"];

// LayoutGridはChildren.toArray(children)で直接の子要素数を数えるため、コンポーネント呼び出し
// (<ItemCells items={...} />)にすると1要素としてしか認識されない。layout/grid/page.tsxの
// gridCellsと同じく、配列を返すプレーンな関数として呼び出しJSXのchildren位置に直接展開する。
function itemCells(items: string[]) {
  return items.map((item) => (
    <Card
      key={item}
      theme="green"
      backgroundColor="$color4"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$5"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
    >
      <Text fontSize="$6" fontWeight="700" color="$color11">
        {item}
      </Text>
    </Card>
  ));
}

export default function ShufflePage() {
  const manual = useShuffle(SAMPLE_ITEMS);
  const auto = useShuffle(SAMPLE_ITEMS);

  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="シャッフル"
        description="配列をシャッフルするuseShuffleフックのサンプルです。ボタンでシャッフルするブロックと、画面読み込みのたびに順番が変わるブロックがあります。"
      />

      <YStack gap="$3">
        <H3>ボタンでシャッフル</H3>
        <LayoutGrid>{itemCells(manual.items)}</LayoutGrid>
        <StyledButton alignSelf="flex-start" onPress={manual.reshuffle}>
          シャッフル
        </StyledButton>
      </YStack>

      <YStack gap="$3">
        <H3>画面読み込みのたびにシャッフル</H3>
        <LayoutGrid>{itemCells(auto.items)}</LayoutGrid>
      </YStack>
    </YStack>
  );
}
