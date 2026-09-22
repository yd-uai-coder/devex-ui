"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * True only after the client has hydrated; false during SSR and the initial
 * client render. Use this to gate any rendering that depends on client-only
 * state (e.g. localStorage) so the first client render matches the server
 * render exactly, avoiding hydration mismatches.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
