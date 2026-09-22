"use client";

import Link from "next/link";
import { H1, H4, Text, XStack, YStack } from "tamagui";
import { Column } from "@/components/ui/primitives/Column";
import { MENU_TREE } from "@/lib/menu-tree";
import menuStyles from "@/components/layout/Menu.module.css";

function menuGroupColumns() {
  return MENU_TREE.map((group) => (
    <Column key={group.label}>
      <H4>{group.label}</H4>
      <YStack gap="$1.5">
        {group.children.map((item) => (
          <Text key={item.href} fontSize="$3" color="$color11">
            <Link href={item.href} className={menuStyles.navLink}>
              {item.label}
            </Link>
          </Text>
        ))}
      </YStack>
    </Column>
  ));
}

export function NotFoundContent() {
  return (
    <YStack gap="$6" paddingVertical="$6">
      <H1>指定のページは存在しません</H1>
      <XStack flexDirection="column" $md={{ flexDirection: "row" }} gap="$4">
        {menuGroupColumns()}
      </XStack>
    </YStack>
  );
}
