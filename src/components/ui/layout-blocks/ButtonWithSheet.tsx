"use client";

import { useState, type ReactNode } from "react";
import type { ButtonProps } from "tamagui";
import { Sheet, Text, XStack } from "tamagui";
import { StyledButton } from "@/components/ui/primitives/StyledButton";

export type ButtonWithSheetProps = Omit<ButtonProps, "children"> & {
  buttonLabel?: string;
  /** Sheet内上部に表示する見出し(未指定なら見出し行自体を表示しない) */
  title?: string;
  children: ReactNode;
  snapPoints?: number[];
};

// ボタン押下でSheetを開閉する汎用ラッパー
export function ButtonWithSheet({
  buttonLabel = "開く",
  title,
  children,
  snapPoints = [60],
  ...props
}: ButtonWithSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <StyledButton {...props} onPress={() => setOpen(true)}>
        {buttonLabel}
      </StyledButton>
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={snapPoints}
        dismissOnSnapToBottom
        zIndex={100_000}
      >
        <Sheet.Overlay
          key="overlay"
          transition="quick"
          backgroundColor="rgba(0,0,0,0.5)"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" gap="$3" backgroundColor="$color2">
          {/* タイトル指定時のみ見出し行を表示 */}
          {title ? (
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$6" fontWeight="700">{title}</Text>
              <StyledButton size="$2" chromeless onPress={() => setOpen(false)}>
                閉じる
              </StyledButton>
            </XStack>
          ) : null}
          {children}
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
