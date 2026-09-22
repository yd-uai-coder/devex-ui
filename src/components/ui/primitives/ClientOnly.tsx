"use client";

import type { ReactNode } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";

/**
 * Some Tamagui components (Progress, Slider) compute their visual state from
 * client-measured layout, which differs from the server-rendered markup and
 * causes a hydration mismatch. Mounting them only after the client has
 * hydrated avoids that mismatch entirely.
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  if (!useHasMounted()) {
    return null;
  }

  return <>{children}</>;
}
