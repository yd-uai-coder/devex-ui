"use client";

import { useState } from "react";
import { H2, XStack, YStack } from "tamagui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { StyledButton } from "@/components/ui/primitives/StyledButton";
import { ModeSelectDialog } from "@/features/dashboard/components/ModeSelectDialog";
import { ProjectList } from "@/features/dashboard/components/ProjectList";

export default function DashboardPage() {
  // 新規作成は、まずモード(簡易ドキュメント/詳細設計)を選ばせる(docs/external_design.md 2.7節)。
  // そのため作成画面への直接のリンクではなく、ダイアログを開くボタンにする。
  const [modeDialogOpen, setModeDialogOpen] = useState(false);

  return (
    <RequireAuth>
      <YStack paddingVertical="$4" gap="$6">
        <XStack justifyContent="space-between" alignItems="center">
          <H2>ダッシュボード</H2>
          <StyledButton onPress={() => setModeDialogOpen(true)}>新規プロジェクトを作成</StyledButton>
        </XStack>
        <ProjectList />
      </YStack>
      <ModeSelectDialog open={modeDialogOpen} onClose={() => setModeDialogOpen(false)} />
    </RequireAuth>
  );
}
