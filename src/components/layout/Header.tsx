"use client";

import { H3, XStack } from "tamagui";
import { MenuToggleButton } from "@/components/ui/primitives/MenuToggleButton";
import { ThemeToggleButton } from "@/components/ui/primitives/ThemeToggleButton";
import { HEADER_HEIGHT } from "./layout-constants";

export function Header() {
  return (
    <XStack
      position="fixed"
      top={0}
      left={0}
      right={0}
      height={HEADER_HEIGHT}
      zIndex={300}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
      paddingHorizontal="$4"
      paddingVertical="$4"
      borderBottomWidth={1}
      borderColor="$borderColor"
      backgroundImage="$headerFooterGradient"
    >
      <MenuToggleButton />
      <H3
        flexShrink={1}
        minWidth={0}
        fontSize="$7"
        $md={{ fontSize: "$9" }}
      >
        Next.js + Tamagui Templates
      </H3>
      <ThemeToggleButton />
    </XStack>
  );
}
