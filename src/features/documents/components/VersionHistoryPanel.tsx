"use client";

import { useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";
import {
  listDocumentVersions,
  restoreDocumentVersion,
} from "@/features/documents/api/documentsApi";
import type { DocType, GeneratedDocumentRead } from "@/features/documents/api/documentsApi";
import { useDocumentsStore } from "@/features/documents/documents-store";

type VersionHistoryPanelProps = {
  projectId: string;
  docType: DocType;
};

type LoadStatus = "idle" | "loading" | "success" | "error";

export function VersionHistoryPanel({ projectId, docType }: VersionHistoryPanelProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [versions, setVersions] = useState<GeneratedDocumentRead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  // 履歴は開いたときに初めて取得する(ドキュメント一覧のような常設データではなく、
  // 必要になったときだけ見る補助情報のため)。
  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && status === "idle") {
      setStatus("loading");
      try {
        const result = await listDocumentVersions(projectId, docType);
        setVersions(result);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "バージョン履歴の取得に失敗しました");
      }
    }
  }

  async function handleRestore(version: number) {
    setRestoringVersion(version);
    setError(null);
    try {
      const restored = await restoreDocumentVersion(projectId, docType, version);
      // 復元は新バージョンを作らず表示中バージョンを切り替えるだけ(devex-api側の仕様)ため、
      // 一覧の件数は変えず、表示中バッジだけを付け替える。
      setVersions((current) =>
        current.map((doc) => ({ ...doc, is_current: doc.version === restored.version })),
      );
      // documents-storeを force再取得し、DocumentMarkdownViewが表示する内容(=ダウンロード対象)を
      // 復元した版へ更新する。
      void useDocumentsStore.getState().fetchDocuments(projectId, { force: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "復元に失敗しました");
    } finally {
      setRestoringVersion(null);
    }
  }

  return (
    <YStack gap="$2">
      <Button size="$3" onPress={handleToggle}>
        {open ? "履歴を閉じる" : "バージョン履歴"}
      </Button>
      {open ? (
        <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$4" padding="$3" gap="$2">
          {status === "loading" ? <Text>読み込み中...</Text> : null}
          {error ? (
            <Text role="alert" color="$color9">
              {error}
            </Text>
          ) : null}
          {status === "success" && versions.length === 0 ? (
            <Text color="$color9">履歴がありません</Text>
          ) : null}
          {versions.map((doc, index) => (
            <XStack key={doc.id} justifyContent="space-between" alignItems="center" gap="$2">
              <Text>
                v{doc.version}
                {index === 0 ? "(最新)" : ""}
                {doc.is_current ? "(表示中)" : ""} ──{" "}
                {new Date(doc.created_at).toLocaleString("ja-JP")}
              </Text>
              {!doc.is_current ? (
                <Button
                  size="$2"
                  disabled={restoringVersion !== null}
                  onPress={() => handleRestore(doc.version)}
                >
                  {restoringVersion === doc.version ? "復元中..." : "この内容で復元する"}
                </Button>
              ) : null}
            </XStack>
          ))}
        </YStack>
      ) : null}
    </YStack>
  );
}
