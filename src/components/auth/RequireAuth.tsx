"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/components/auth/auth-store";
import { useHasMounted } from "@/hooks/useHasMounted";
import { LoginRequiredDialog } from "@/components/auth/LoginRequiredDialog";

// 未ログイン時にログイン必須ダイアログを表示し、保護対象のchildrenを隠す。
// ページ全体やレイアウト単位で <RequireAuth>...</RequireAuth> のように使う。
export function RequireAuth({ children }: { children: ReactNode }) {
  const mounted = useHasMounted();
  const accessToken = useAuthStore((s) => s.accessToken);
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  // マウント前はハイドレーション不一致を避けるため非表示
  if (!mounted) return null;

  // 未ログイン時はログイン必須ダイアログを表示
  if (!accessToken) {
    return (
      <LoginRequiredDialog
        open={open}
        onClose={() => setOpen(false)}
        redirectTo={pathname}
        closeBehavior="redirectHome"
      />
    );
  }

  return <>{children}</>;
}
