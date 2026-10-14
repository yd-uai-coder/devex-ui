"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, H2, Text, XStack, YStack } from "tamagui";
import { ConfirmDialog } from "@/components/ui/layout-blocks/ConfirmDialog";
import { ReviewPanel } from "@/features/design-review/components/ReviewPanel";
import { documentOfTarget } from "@/features/design-review/model";
import type { TargetActionOf } from "@/features/design-review/model";
import type { DocType } from "@/features/documents/api/documentsApi";
import { DocumentTabs } from "@/features/documents/components/DocumentTabs";
import { useDocumentsStore } from "@/features/documents/documents-store";
import {
  DOC_LABEL,
  modeDocTypes,
  progressText,
  regenerationTargets,
  startLabel,
} from "@/features/documents/regenerationOps";
import { POLL_INTERVAL_MS, useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useInterval } from "@/hooks/useInterval";

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
  const progress = useDocumentsStore((s) => s.progress);
  const fetchProgress = useDocumentsStore((s) => s.fetchProgress);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // 再生成の起点(その文書から下流を作り直す)
  const docTypes = modeDocTypes(projectMode === "detailed" ? "detailed" : "simple");
  const [startFrom, setStartFrom] = useState<DocType>("requirements");
  // 表示中の文書のタブ(レビューの指摘の対象から移る)
  const [activeType, setActiveType] = useState<DocType | null>(null);

  useEffect(() => {
    void fetchDocuments(projectId);
    void fetchProjectMode(projectId);
  }, [projectId, fetchDocuments, fetchProjectMode]);

  // 再生成トリガー後の完了検知は、ヒアリング画面と同じuseGenerationPollingを使う。
  const { timedOut } = useGenerationPolling(projectId, regenerating, () => {
    onRegenerationCompleted(projectId);
  });
  // 再生成中は、文書ごとの進み具合も取り直す(初めの1回はすぐ取る)
  useEffect(() => {
    if (regenerating) void fetchProgress(projectId);
  }, [regenerating, projectId, fetchProgress]);
  useInterval(() => void fetchProgress(projectId), regenerating && !timedOut ? POLL_INTERVAL_MS : null);

  // レビューの指摘の対象から、それを載せている文書のタブへ移る(推定できない対象は押せない)
  const targetAction: TargetActionOf = (target) => {
    const type = documentOfTarget(target);
    if (type === null || !documents.some((doc) => doc.doc_type === type)) return null;
    return { label: "この文書を開く", onPress: () => setActiveType(type) };
  };
  // 文書の版が変わったら(生成・再生成・復元)、レビューの区切りを取り直す
  const versionsKey = documents.map((doc) => `${doc.doc_type}:${doc.version}`).join(",");

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
          {/* 簡易モードは、同じ画面(SCR-008)を段階8(実装手順書)だけで開く(入力は4文書) */}
          {projectMode === "simple" ? (
            <Link href={`/projects/${projectId}/detailed-design`}>
              <Text color="$blue10">実装手順書へ進む →</Text>
            </Link>
          ) : null}
          <Button
            size="$3"
            disabled={regenerating}
            onPress={() => {
              setStartFrom(docTypes[0]);
              setConfirmOpen(true);
            }}
          >
            {regenerating ? "再生成中..." : "再生成する"}
          </Button>
        </XStack>
      </XStack>

      {regenerateError ? (
        <Text role="alert" color="$color9">
          {regenerateError}
        </Text>
      ) : null}
      {regenerating && !timedOut ? (
        <Text color="$color11">再生成しています。しばらくお待ちください...</Text>
      ) : null}
      {/* 文書ごとの進み具合(要件定義：生成完了 外部設計：生成中 …) */}
      {regenerating && progress ? (
        <Text role="status" color="$color11" aria-label="再生成の進み具合">
          {progressText(docTypes, progress)}
        </Text>
      ) : null}
      {/* 待つ時間の上限(3分)を過ぎたら待つのをやめる。読み込み直すと、まだ生成中なら続きを待つ */}
      {regenerating && timedOut ? (
        <Text role="alert" color="$color9">
          再生成に時間がかかっています。しばらくしてから画面を読み込み直してください(生成中なら続きを待ちます)。
        </Text>
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

      {/* AI 設計レビュー(superuser だけ。文書の生成の後の区切り) */}
      <ReviewPanel projectId={projectId} gates={["documents"]} targetAction={targetAction} refreshKey={versionsKey} />

      <DocumentTabs
        projectId={projectId}
        documents={documents}
        activeType={activeType}
        onActiveTypeChange={setActiveType}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="設計書を再生成しますか"
        description={
          // 説明は段落の中に出るので、ブロック要素を入れず、ラベルの表示だけを行にする
          <>
            どこから作り直すかを選んでください。下流の文書は上流を入力にして作るので、選んだ文書より下流も作り直します。今の版は履歴に残ります。
            {docTypes.map((type) => (
              <label key={type} style={{ display: "block", marginTop: 6 }}>
                <input
                  type="radio"
                  name="regeneration-start"
                  checked={startFrom === type}
                  onChange={() => setStartFrom(type)}
                />{" "}
                {startLabel(docTypes, type)}
                <span style={{ color: "var(--color10)", fontSize: 12 }}>
                  {`(${regenerationTargets(docTypes, type)
                    .map((t) => DOC_LABEL[t])
                    .join("・")})`}
                </span>
              </label>
            ))}
          </>
        }
        confirmLabel="再生成する"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void regenerate(projectId, startFrom === docTypes[0] ? undefined : startFrom);
        }}
      />
    </YStack>
  );
}
