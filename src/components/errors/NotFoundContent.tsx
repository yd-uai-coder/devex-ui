"use client";

import Link from "next/link";
import { H1, H4, XStack, YStack } from "tamagui";
import { Column } from "@/components/ui/primitives/Column";
import { MenuEntry } from "@/components/layout/MenuEntry";
import { useMenuTree } from "@/components/layout/useMenuTree";
import { menuItemKey, type MenuGroup } from "@/lib/menu-tree";
import menuStyles from "@/components/layout/Menu.module.css";

function menuGroupColumns(tree: MenuGroup[]) {
  return tree.map((group) => (
    <Column key={group.label}>
      {/* 子を持たないリンクのグループ(TOP)は、見出しをリンクにする */}
      <H4>
        {group.href !== undefined ? (
          <Link href={group.href} className={menuStyles.navLink}>
            {group.label}
          </Link>
        ) : (
          group.label
        )}
      </H4>
      <YStack gap="$1.5">
        {group.children.map((item) => (
          <MenuEntry key={menuItemKey(item)} item={item} fontSize="$3" />
        ))}
      </YStack>
    </Column>
  ));
}

export function NotFoundContent() {
  const tree = useMenuTree();

  return (
    <YStack gap="$6" paddingVertical="$6">
      <H1>指定のページは存在しません</H1>
      <XStack flexDirection="column" $md={{ flexDirection: "row" }} gap="$4">
        {menuGroupColumns(tree)}
      </XStack>
    </YStack>
  );
}
