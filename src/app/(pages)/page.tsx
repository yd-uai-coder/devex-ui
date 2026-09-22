"use client";

import Link from "next/link";
import { Card, H1, H2, H3, Paragraph, Text, YStack } from "tamagui";
import { Hero } from "@/components/ui/media/Hero";
import { LayoutGrid } from "@/components/ui/layout-blocks/LayoutGrid";
import { MENU_TREE } from "@/lib/menu-tree";
import menuStyles from "@/components/layout/Menu.module.css";

const HERO_IMAGE = "https://dummyimage.com/1200x800/b3e687/ffffff&text=Next.js_Tamagui";

function menuGroupCards() {
  return MENU_TREE.map((group, index) => (
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
          <Text key={item.href} fontSize="$5" color="$color11">
            <Link href={item.href} className={menuStyles.navLink}>
              {item.label}
            </Link>
          </Text>
        ))}
      </YStack>
    </Card>
  ));
}

export default function Home() {
  return (
    <YStack gap="$8" paddingVertical="$4">
      <Hero mode="imageRight" imageSrc={HERO_IMAGE} imageAlt="Next.js + Tamagui Templates">
        <YStack gap="$3">
          <H1>Next.js + Tamagui Templates</H1>
          <Paragraph color="$color11">
            Next.js (App Router) と Tamagui によるUIテンプレート集です。UIデザインにおける実装サンプルとして活用でき、cloneすれば今後のアプリ開発で開発・テストをスムーズに進められます。
          </Paragraph>
        </YStack>
      </Hero>

      <YStack gap="$4">
        <H2>コンポーネントサンプル</H2>
        <LayoutGrid columns={{ base: 1, md: 3 }} aspectRatio={1/ 1}>
          {menuGroupCards()}
        </LayoutGrid>
      </YStack>
    </YStack>
  );
}
