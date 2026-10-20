"use client";

import { useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";
import { AgreementStatusPanel } from "@/features/agreements/components/AgreementStatusPanel";
import { downloadDocument } from "@/features/documents/api/documentsApi";
import { saveFile } from "@/lib/api/download";
import type { GeneratedDocumentRead } from "@/features/documents/api/documentsApi";
import { ExternalDesignSummaryPanel } from "@/features/documents/components/ExternalDesignSummaryPanel";
import { MarkdownBody } from "@/features/documents/components/MarkdownBody";
import { RequirementsSummaryPanel } from "@/features/documents/components/RequirementsSummaryPanel";
import { SimpleDesignSummaryPanel } from "@/features/documents/components/SimpleDesignSummaryPanel";
import { VersionHistoryPanel } from "@/features/documents/components/VersionHistoryPanel";
import { useDocumentsStore } from "@/features/documents/documents-store";

type DocumentMarkdownViewProps = {
  projectId: string;
  // 引数名をdocumentにするとグローバルのwindow.documentを覆い隠すため、
  // ダウンロード処理内ではwindow.documentと明示して区別する。
  document: GeneratedDocumentRead;
};

export function DocumentMarkdownView({ projectId, document }: DocumentMarkdownViewProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const projectMode = useDocumentsStore((s) => s.projectMode);
  // 行の合意は詳細設計モードの要件定義書・外部設計書だけ(簡易モードは API も呼ばない)
  const agreementDocType =
    projectMode === "detailed" && (document.doc_type === "requirements" || document.doc_type === "external_design")
      ? document.doc_type
      : null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(document.content);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
    }
  }

  async function handleDownload() {
    setDownloadError(null);
    try {
      const { filename, content } = await downloadDocument(projectId, document.id);
      saveFile(filename, content, "text/markdown;charset=utf-8");
    } catch {
      setDownloadError("ダウンロードに失敗しました");
    }
  }

  return (
    <YStack gap="$3">
      <XStack gap="$2">
        <Button size="$3" onPress={handleCopy}>
          {copyStatus === "copied" ? "コピーしました" : "クリップボードにコピー"}
        </Button>
        <Button size="$3" onPress={handleDownload}>
          ダウンロード(.md)
        </Button>
      </XStack>
      {copyStatus === "error" ? (
        <Text role="alert" color="$color9">
          コピーに失敗しました
        </Text>
      ) : null}
      {downloadError ? (
        <Text role="alert" color="$color9">
          {downloadError}
        </Text>
      ) : null}
      <VersionHistoryPanel projectId={projectId} docType={document.doc_type} />
      <RequirementsSummaryPanel projectId={projectId} document={document} />
      <ExternalDesignSummaryPanel document={document} />
      <SimpleDesignSummaryPanel document={document} />
      {agreementDocType ? (
        // 版の切り替え(id)と、「採用にする」で同じ版の中身が変わったとき(content)に取り直す
        <AgreementStatusPanel
          projectId={projectId}
          docType={agreementDocType}
          refreshKey={`${document.id}:${document.content}`}
        />
      ) : null}
      <MarkdownBody content={document.content} />
    </YStack>
  );
}
