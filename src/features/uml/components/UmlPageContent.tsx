"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, H2, Separator, Text, XStack, YStack } from "tamagui";
import { DiagramList } from "@/features/uml/components/DiagramList";
import { GenerationPanel } from "@/features/uml/components/GenerationPanel";
import { GenerationRunHistory } from "@/features/uml/components/GenerationRunHistory";
import { useUmlGenerationPolling } from "@/features/uml/hooks/useUmlGenerationPolling";
import { isGenerating, useUmlStore } from "@/features/uml/uml-store";

// 生成・一覧画面(SCR-007 の前半)。生成の受け付け・ポーリング・生成履歴・図の一覧を並べる。
export function UmlPageContent({ projectId }: { projectId: string }) {
  const diagrams = useUmlStore((s) => s.diagrams);
  const status = useUmlStore((s) => s.status);
  const error = useUmlStore((s) => s.error);
  const fetchAll = useUmlStore((s) => s.fetchAll);

  useEffect(() => {
    void fetchAll(projectId);
  }, [projectId, fetchAll]);

  const generating = isGenerating(diagrams);
  const { timedOut, resetTimeout } = useUmlGenerationPolling(projectId, generating);

  return (
    <YStack paddingVertical="$4" gap="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <H2>UML設計図</H2>
        <Link href={`/projects/${projectId}/documents`}>
          <Text color="$blue10">ドキュメントに戻る</Text>
        </Link>
      </XStack>

      {status === "loading" && diagrams.length === 0 ? (
        <Text color="$color11">読み込み中...</Text>
      ) : null}
      {status === "error" ? (
        <Text role="alert" color="$color9">
          {error}
        </Text>
      ) : null}
      {generating && !timedOut ? (
        <Text color="$color11">設計図を生成しています。しばらくお待ちください...</Text>
      ) : null}
      {generating && timedOut ? (
        <XStack gap="$3" alignItems="center">
          <Text role="alert" color="$color9">
            生成に時間がかかっています。自動更新を止めました。
          </Text>
          <Button
            size="$2"
            onPress={() => {
              resetTimeout();
              void fetchAll(projectId, { force: true });
            }}
          >
            再読み込み
          </Button>
        </XStack>
      ) : null}

      <GenerationPanel projectId={projectId} />
      <Separator />
      <DiagramList projectId={projectId} />
      <Separator />
      <GenerationRunHistory />
    </YStack>
  );
}
