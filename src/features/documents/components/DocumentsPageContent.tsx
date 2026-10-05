"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, H2, Text, XStack, YStack } from "tamagui";
import { ConfirmDialog } from "@/components/ui/layout-blocks/ConfirmDialog";
import { DocumentTabs } from "@/features/documents/components/DocumentTabs";
import { useDocumentsStore } from "@/features/documents/documents-store";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export function DocumentsPageContent({ projectId }: { projectId: string }) {
  const documents = useDocumentsStore((s) => s.documents);
  const status = useDocumentsStore((s) => s.status);
  const error = useDocumentsStore((s) => s.error);
  const regenerating = useDocumentsStore((s) => s.regenerating);
  const regenerateError = useDocumentsStore((s) => s.regenerateError);
  const fetchDocuments = useDocumentsStore((s) => s.fetchDocuments);
  const regenerate = useDocumentsStore((s) => s.regenerate);
  const onRegenerationCompleted = useDocumentsStore((s) => s.onRegenerationCompleted);
  const projectMode = useDocumentsStore((s) => s.projectMode);
  const fetchProjectMode = useDocumentsStore((s) => s.fetchProjectMode);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    void fetchDocuments(projectId);
    void fetchProjectMode(projectId);
  }, [projectId, fetchDocuments, fetchProjectMode]);

  // 再生成トリガー後の完了検知は、ヒアリング画面と同じuseGenerationPollingを使う。
  useGenerationPolling(projectId, regenerating, () => {
    onRegenerationCompleted(projectId);
  });

  return (
    <YStack paddingVertical="$4" gap="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <H2>ドキュメントプレビュー</H2>
        <XStack gap="$3" alignItems="center">
          <Link href={`/projects/${projectId}/chat`}>
            <Text color="$blue10">チャットに戻る</Text>
          </Link>
          {/* 詳細設計モードは、ここから詳細設計画面(SCR-008)へ進む(内部設計書は段階で組み立てる) */}
          {projectMode === "detailed" ? (
            <Link href={`/projects/${projectId}/detailed-design`}>
              <Text color="$blue10">詳細設計へ進む →</Text>
            </Link>
          ) : null}
          <Button size="$3" disabled={regenerating} onPress={() => setConfirmOpen(true)}>
            {regenerating ? "再生成中..." : "再生成する"}
          </Button>
        </XStack>
      </XStack>

      {regenerateError ? (
        <Text role="alert" color="$color9">
          {regenerateError}
        </Text>
      ) : null}
      {regenerating ? (
        <Text color="$color11">再生成しています。しばらくお待ちください...</Text>
      ) : null}
      {status === "loading" && documents.length === 0 ? (
        <Text color="$color11">読み込み中...</Text>
      ) : null}
      {status === "error" ? (
        <Text role="alert" color="$color9">
          {error}
        </Text>
      ) : null}
      {status === "success" && documents.length === 0 ? (
        <Text color="$color11">まだ生成されたドキュメントがありません。</Text>
      ) : null}

      <DocumentTabs projectId={projectId} documents={documents} />

      <ConfirmDialog
        open={confirmOpen}
        title="設計書を再生成しますか"
        description="チャットの内容から設計書を作り直します。今の版は履歴に残ります。生成には数分かかります。"
        confirmLabel="再生成する"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void regenerate(projectId);
        }}
      />
    </YStack>
  );
}
