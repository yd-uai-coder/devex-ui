"use client";

import { useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";
import {
  downloadDetailedDesign,
  downloadImplementationProcedure,
  type DownloadedDocument,
} from "@/features/detailed-design/api/designStagesApi";
import type { DesignStageRead } from "@/features/detailed-design/api/types";
import { saveFile } from "@/lib/api/download";

// 出力したファイルは最終成果物。直接編集しても Devex には戻らない
export const DOCUMENT_NOTICE =
  "ダウンロードしたファイルを直接編集しても、Devex には反映されません。修正は Devex の画面で行ってください。";

// 押せないボタンの透過(段階のステッパーの、開いていない段階と同じ考え方)
const DISABLED_OPACITY = 0.5;

type DownloadItem = {
  label: string;
  // zip の元になる段階。すべて承認済み(古くない)になるまで押せない(サーバーも 409 で断る)
  stages: number[];
  download: (projectId: string) => Promise<DownloadedDocument>;
};

// 詳細設計書(01〜07章)と実装計画は段階1〜7、実装手順書は段階8から作る
export const DOWNLOADS: DownloadItem[] = [
  {
    label: "詳細設計書・実装計画をダウンロード(.zip)",
    stages: [1, 2, 3, 4, 5, 6, 7],
    download: downloadDetailedDesign,
  },
  {
    label: "実装手順書をダウンロード(.zip)",
    stages: [8],
    download: downloadImplementationProcedure,
  },
];

// targets のうち、承認済み(古くない)でない段階。
export function unapprovedStages(stages: DesignStageRead[], targets: number[]): number[] {
  return targets.filter((target) => stages.find((s) => s.stage === target)?.state !== "approved");
}

// SCR-008 の上部に置く、2つの zip(詳細設計書・実装計画 / 実装手順書)のダウンロード。
// 元になる段階が承認されるまでボタンを押せなくし(透過表示)、どの段階が未承認かを横に出す。
export function DesignDocumentBar({
  projectId,
  stages,
}: {
  projectId: string;
  stages: DesignStageRead[];
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (item: DownloadItem) => {
    setBusy(item.label);
    setError(null);
    try {
      const { filename, content } = await item.download(projectId);
      saveFile(filename, content, "application/zip");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ダウンロードに失敗しました");
    } finally {
      setBusy(null);
    }
  };

  return (
    <YStack gap="$2">
      {DOWNLOADS.map((item) => {
        const missing = unapprovedStages(stages, item.stages);
        const ready = missing.length === 0;
        return (
          <XStack key={item.label} gap="$3" alignItems="center" flexWrap="wrap">
            <Button
              size="$3"
              onPress={() => void handleDownload(item)}
              disabled={!ready || busy !== null}
              opacity={ready ? 1 : DISABLED_OPACITY}
            >
              {busy === item.label ? "準備中..." : item.label}
            </Button>
            <Text role="status" color={ready ? "$color11" : "$orange10"} fontSize="$2">
              {ready
                ? "承認済みです。"
                : `段階${missing.join("・")}が未承認です。承認するとダウンロードできます。`}
            </Text>
          </XStack>
        );
      })}
      <Text color="$color11" fontSize="$2">
        {DOCUMENT_NOTICE}
      </Text>
      {error ? (
        <Text role="alert" color="$red10">
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
