"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, XStack } from "tamagui";
import { StyledButton } from "@/components/ui/primitives/StyledButton";

export type LoginRequiredDialogCloseBehavior = "stay" | "redirectHome";

// ログイン(・必要ならユーザー登録)への案内ダイアログ。loginHref/registerHrefは実際のアプリ側で
// 用意するログイン/登録ページのパスを指定する(このテンプレート自体には/loginページを含まない)。
// registerHrefを省略すると登録ボタンは表示しない。
export function LoginRequiredDialog({
  open,
  onClose,
  redirectTo,
  closeBehavior,
  loginHref = "/login",
  registerHref,
}: {
  open: boolean;
  onClose: () => void;
  redirectTo: string;
  closeBehavior: LoginRequiredDialogCloseBehavior;
  loginHref?: string;
  registerHref?: string;
}) {
  const router = useRouter();
  const query = `?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <Dialog
      modal
      open={open}
      onOpenChange={(next) => {
        // 閉じられたら後処理を行う
        if (!next) {
          onClose();
          // 指定時はトップページへ退避
          if (closeBehavior === "redirectHome") router.push("/");
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          transition="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          key="content"
          bordered
          elevate
          gap="$4"
          padding="$5"
          maxWidth={360}
          transition="quick"
          enterStyle={{ opacity: 0, scale: 0.95, y: 10 }}
          exitStyle={{ opacity: 0, scale: 0.95, y: 10 }}
        >
          <Dialog.Title>ログインが必要です</Dialog.Title>
          <Dialog.Description>この先のコンテンツへ進むにはログインが必要です。</Dialog.Description>
          <XStack gap="$3" justifyContent="flex-end">
            {registerHref ? (
              <Link href={`${registerHref}${query}`} onClick={onClose}>
                <StyledButton>ユーザー登録</StyledButton>
              </Link>
            ) : null}
            <Link href={`${loginHref}${query}`} onClick={onClose}>
              <StyledButton>ログイン</StyledButton>
            </Link>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
