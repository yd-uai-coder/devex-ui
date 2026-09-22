"use client";

import { useState, type ComponentProps } from "react";
import Link from "next/link";
import { useAuthStore } from "@/components/auth/auth-store";
import { useHasMounted } from "@/hooks/useHasMounted";
import { LoginRequiredDialog } from "@/components/auth/LoginRequiredDialog";

type GuardedLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

// ログインが必要なリンク用。未ログイン時はハードリダイレクトせず遷移前にログイン必須
// ダイアログを表示する(ダイアログ側の「ログイン」ボタンから ?redirect=href で元の遷移先に戻れる)。
export function GuardedLink({ href, onClick, children, ...rest }: GuardedLinkProps) {
  const mounted = useHasMounted();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [open, setOpen] = useState(false);
  const shouldGuard = mounted && !accessToken;

  return (
    <>
      <Link
        href={href}
        {...rest}
        onClick={(e) => {
          // 未ログインなら遷移を止めダイアログを表示
          if (shouldGuard) {
            e.preventDefault();
            setOpen(true);
          }
          onClick?.(e);
        }}
      >
        {children}
      </Link>
      {shouldGuard && (
        <LoginRequiredDialog open={open} onClose={() => setOpen(false)} redirectTo={href} closeBehavior="stay" />
      )}
    </>
  );
}
