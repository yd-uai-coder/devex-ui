"use client";

import { useEffect, useState } from "react";
import { XStack, YStack } from "tamagui";
import { useMenuStore } from "./menu-store";
import { MenuToggleButton } from "@/components/ui/primitives/MenuToggleButton";
import styles from "./Menu.module.css";
import { HierarchicalMenu } from "@/components/layout/HierarchicalMenu"


export function Menu() {
  const isOpen = useMenuStore((state) => state.isOpen);
  const open = useMenuStore((state) => state.open);
  const [instant, setInstant] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, [open]);

  return (
    <YStack
      className={styles.menu}
      data-open={isOpen}
      data-instant={instant}
      data-testid="menu"
      backgroundColor="$background"
      borderRightWidth={1}
      borderColor="$borderColor"
      padding="$5"
      gap="$4"
    >
      <XStack justifyContent="flex-end">
        <MenuToggleButton />
      </XStack>
      <HierarchicalMenu/>
    </YStack>
  );
}
