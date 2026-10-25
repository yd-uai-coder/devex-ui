"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { YStack } from "tamagui";
import { Header} from "./Header";
import { Menu } from "./Menu";
import { Footer } from "./Footer";
import { HEADER_HEIGHT, FOOTER_HEIGHT } from "./layout-constants";
import { isClientPage } from "./client-page";

// クライアント向けのページ(共有リンク)では、開発者向けのメニュー・フッターを出さず、題もリンクにしない
export function AppShell({ children }: { children: ReactNode }) {
  const plain = isClientPage(usePathname());
  return (
    <YStack minHeight="100vh">
      <Header plain={plain} />
      {plain ? null : <Menu />}
      <YStack
        paddingTop={HEADER_HEIGHT + 16}
        paddingBottom={(plain ? 0 : FOOTER_HEIGHT) + 16}
        paddingHorizontal="$6"
      >
        {children}
      </YStack>
      {plain ? null : <Footer />}
    </YStack>
  );
}
