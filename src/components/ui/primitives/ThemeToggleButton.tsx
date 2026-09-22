"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "tamagui";
import { useThemeSetting } from "@tamagui/next-theme";
import { useHasMounted } from "@/hooks/useHasMounted";

export function ThemeToggleButton() {
  const themeSetting = useThemeSetting();
  const mounted = useHasMounted();
  // Before mount, resolvedTheme may already reflect a persisted localStorage
  // preference on the client while the server always rendered the default,
  // so we force the deterministic default until after hydration completes.
  const isDark = mounted && themeSetting.resolvedTheme === "dark";

  return (
    <Button
      circular
      size="$3"
      onPress={() => themeSetting.toggle()}
      aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
    />
  );
}
