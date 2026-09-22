"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Accordion, Square, Text, YStack } from "tamagui";
import { useMenuStore } from "./menu-store";
import { MENU_TREE } from "@/lib/menu-tree";
import styles from "@/components/layout/Menu.module.css";

export function HierarchicalMenu() {
  const pathname = usePathname();
  const close = useMenuStore((state) => state.close);
  // 初期状態は現在のURLが属するグループだけを開く(pathnameはSSR/hydration間で
  // 一致するため、useStateの遅延初期化に使ってもミスマッチは起きない)。
  // 1つ開くと他が閉じる排他仕様のため、開いているグループは常に高々1件(文字列)で管理する。
  const [openGroup, setOpenGroup] = useState<string>(() => {
    const current = MENU_TREE.find((group) => group.children.some((item) => item.href === pathname));
    return current?.label ?? "";
  });

  return (
    <Accordion type="single" collapsible value={openGroup} onValueChange={setOpenGroup} overflow="hidden">
      {MENU_TREE.map((group) => (
        <Accordion.Item key={group.label} value={group.label}>
          <Accordion.Header>
            <Accordion.Trigger
              width="100%"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal={0}
              paddingVertical="$2"
              borderWidth={0}
              backgroundColor="transparent"
            >
              {({ open }: { open: boolean }) => (
                <>
                  <Text fontSize="$5" fontWeight="700" color="$color11">
                    {group.label}
                  </Text>
                  <Square transparent transition="quick" rotate={open ? "180deg" : "0deg"}>
                    <ChevronDown size={16} color="var(--color)" />
                  </Square>
                </>
              )}
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.HeightAnimator transition="300ms">
            <Accordion.Content transition="150ms" exitStyle={{ opacity: 0 }} paddingHorizontal={0}>
              <YStack gap="$2" paddingLeft="$3" paddingTop="$1" paddingBottom="$2">
                {group.children.map((item) => (
                  <Text key={item.href} fontSize="$4" color="$color11" onPress={close}>
                    <Link href={item.href} className={styles.navLink}>
                      {item.label}
                    </Link>
                  </Text>
                ))}
              </YStack>
            </Accordion.Content>
          </Accordion.HeightAnimator>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
