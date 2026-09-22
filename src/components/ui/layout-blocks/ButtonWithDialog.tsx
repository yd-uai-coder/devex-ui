"use client";

import type { ReactNode } from "react";
import { Dialog, type ButtonProps } from "tamagui";
import { StyledButton } from "@/components/ui/primitives/StyledButton";

export type ButtonWithDialogProps = Omit<ButtonProps, "children"> & {
  buttonLabel?: string;
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
};

// ボタン押下でDialogを開く汎用トリガーコンポーネント
export function ButtonWithDialog({
  buttonLabel = "ButtonLabel",
  children,
  onOpenChange,
  ...props
}: ButtonWithDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        {/* Tamagui Buttonは文字列childrenを内部Textでellipsis: true既定のままラップするため、
            PC幅では気付かないがモバイル幅でボタンが狭くなると選択肢テキストが「...」で
            途中省略されてしまう。ellipsis/textPropsはButton自体が用意する正規のオプトアウト
            手段で、Textを自前で組み直すよりcolor/fontSize等の自動継承を壊さず安全 */}
        <StyledButton ellipsis={false} textProps={{ whiteSpace: "normal" }} {...props}>
          {buttonLabel}
        </StyledButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          transition="quick"
          opacity={0.5}
          backgroundColor="$background"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        {children}
      </Dialog.Portal>
    </Dialog>
  );
}
