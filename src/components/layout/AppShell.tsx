"use client";

import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { Header} from "./Header";
import { Menu } from "./Menu";
import { Footer } from "./Footer";
import { HEADER_HEIGHT, FOOTER_HEIGHT } from "./layout-constants";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <YStack minHeight="100vh">
      <Header />
      <Menu />
      <YStack
        paddingTop={HEADER_HEIGHT + 16}
        paddingBottom={FOOTER_HEIGHT + 16}
        paddingHorizontal="$6"
      >
        {children}
      </YStack>
      <Footer />
    </YStack>
  );
}
