"use client";

import { Card, H1, H2, H3, Paragraph, YStack } from "tamagui";
import { Hero } from "@/components/ui/media/Hero";
import { LayoutGrid } from "@/components/ui/layout-blocks/LayoutGrid";
import { MenuEntry } from "@/components/layout/MenuEntry";
import { useMenuTree } from "@/components/layout/useMenuTree";
import { menuItemKey, type MenuGroup } from "@/lib/menu-tree";

const HERO_IMAGE = "https://dummyimage.com/1200x800/b3e687/ffffff&text=Devex";

// トップページ自身へのリンクのグループ(TOP)はカードにしない
function menuGroupCards(tree: MenuGroup[]) {
  return tree.filter((group) => group.href !== "/").map((group, index) => (
    <Card
      key={group.label}
      theme={index % 2 === 0 ? "green" : "blue"}
      backgroundColor="$color4"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$5"
      width="100%"
      height="100%"
      padding="$4"
      gap="$4"
    >
      <H3 fontSize="$8" fontWeight="700" color="$color11">
        {group.label}
      </H3>
      <YStack gap="$3">
        {group.children.map((item) => (
          <MenuEntry key={menuItemKey(item)} item={item} fontSize="$5" />
        ))}
      </YStack>
    </Card>
  ));
}

export default function Home() {
  const tree = useMenuTree();

  return (
    <YStack gap="$8" paddingVertical="$4">
      <Hero mode="imageRight" imageSrc={HERO_IMAGE} imageAlt="Devex">
        <YStack gap="$3">
          <H1>Devex</H1>
          <Paragraph color="$color11">
            AIとの対話ヒアリングから、要件定義書・外部設計書・内部設計書・実装計画書の4種類のドキュメントを自動生成するアプリケーションです。プロジェクトを作成し、チャットでヒアリングに答えるだけで設計書一式が仕上がります。
          </Paragraph>
        </YStack>
      </Hero>

      <YStack gap="$4">
        <H2>はじめる</H2>
        <LayoutGrid columns={{ base: 1, md: 3 }} aspectRatio={1/ 1}>
          {menuGroupCards(tree)}
        </LayoutGrid>
      </YStack>
    </YStack>
  );
}
