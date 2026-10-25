"use client";

import Link from "next/link";
import { H3, Square, XStack } from "tamagui";
import { MenuToggleButton } from "@/components/ui/primitives/MenuToggleButton";
import { ThemeToggleButton } from "@/components/ui/primitives/ThemeToggleButton";
import { HEADER_HEIGHT } from "./layout-constants";
import styles from "./Menu.module.css";

// plain はクライアント向けのページの外枠(メニューの開閉ボタンを出さず、題をトップへのリンクにしない)
export function Header({ plain = false }: { plain?: boolean }) {
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
      {/* plain のときは、題を中央に保つための同じ大きさの空き */}
      {plain ? <Square size="$3" /> : <MenuToggleButton />}
      <H3
        flexShrink={1}
        minWidth={0}
        fontSize="$7"
        $md={{ fontSize: "$9" }}
      >
        {/* タイトルはトップページへのリンク(plain のときはリンクにしない) */}
        {plain ? (
          "Devex"
        ) : (
          <Link href="/" className={styles.titleLink}>
            Devex
          </Link>
        )}
      </H3>
      <ThemeToggleButton />
    </XStack>
  );
}
