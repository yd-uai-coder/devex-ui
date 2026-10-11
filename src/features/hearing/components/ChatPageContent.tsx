"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { H2, Text, XStack, YStack, useMedia } from "tamagui";
import { ChatPanel } from "@/features/hearing/components/ChatPanel";
import { HearingPointsPanel } from "@/features/hearing/components/HearingPointsPanel";
import { useHearingStore } from "@/features/hearing/hearing-store";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { HEADER_HEIGHT } from "@/components/layout/layout-constants";
import { ApiError } from "@/lib/api/client";

// POST /generateは202のみ返す(プッシュ通知が無い)ため、生成完了検知は
// useGenerationPolling(ドキュメントプレビュー画面の再生成と共有)に委ねる。
export function ChatPageContent({ projectId }: { projectId: string }) {
  const router = useRouter();
  const generationTriggered = useHearingStore((s) => s.generationTriggered);
  const projectStatus = useHearingStore((s) => s.projectStatus);
  const points = useHearingStore((s) => s.points);
  const skipPoint = useHearingStore((s) => s.skipPoint);
  const [skippingKey, setSkippingKey] = useState<string | null>(null);
  const [skipError, setSkipError] = useState<string | null>(null);
  // 広い画面(lg 以上)は観点の表をチャットの右に開いて置き、狭い画面はチャットの上に畳んで置く
  const wide = useMedia().lg;

  async function handleSkip(pointKey: string) {
    setSkipError(null);
    setSkippingKey(pointKey);
    try {
      await skipPoint(projectId, pointKey);
    } catch (err) {
      setSkipError(err instanceof ApiError ? err.message : "観点を対象外にできませんでした");
    } finally {
      setSkippingKey(null);
    }
  }

  const { timedOut } = useGenerationPolling(projectId, generationTriggered, () => {
    router.push(`/projects/${projectId}/documents`);
  });

  return (
    <YStack paddingVertical="$4" gap="$4">
      <H2>ヒアリングチャット</H2>
      {generationTriggered && !timedOut ? (
        <Text color="$color11">設計書を生成しています。しばらくお待ちください...</Text>
      ) : null}
      {timedOut ? (
        <Text role="alert" color="$color9">
          生成に時間がかかっています。しばらくしてからダッシュボードを確認してください。
        </Text>
      ) : null}
      {/* completed/revising(修正中)では自動遷移させず、常設リンクとして提示する
          (かつては生成済みプロジェクトを開くと即座に/documentsへ強制的に戻されてしまい、
          チャットをやり直せない不具合があった)。 */}
      {projectStatus === "completed" || projectStatus === "revising" ? (
        <XStack>
          <Link href={`/projects/${projectId}/documents`}>
            <Text color="$blue10">生成済みのドキュメントを見る →</Text>
          </Link>
        </XStack>
      ) : null}
      <YStack gap="$4" $lg={{ flexDirection: "row-reverse", alignItems: "flex-start" }}>
        {points ? (
          // 広い画面では、チャットをスクロールしても表が見えるよう、ヘッダーの下に追従させる
          // (表が画面より長ければ、表の中でスクロールする)
          <YStack
            gap="$2"
            $lg={{
              width: 460,
              flexShrink: 0,
              position: "sticky",
              top: HEADER_HEIGHT + 16,
              maxHeight: `calc(100vh - ${HEADER_HEIGHT + 32}px)`,
              overflowY: "auto",
            }}
          >
            {/* 幅が変わって置き場所が変わったら、開閉の初期値を合わせ直す */}
            <HearingPointsPanel
              key={wide ? "wide" : "narrow"}
              view={points}
              defaultOpen={wide}
              onSkip={generationTriggered ? undefined : handleSkip}
              skippingKey={skippingKey}
            />
            {skipError ? (
              <Text role="alert" color="$color9" fontSize="$2">
                {skipError}
              </Text>
            ) : null}
          </YStack>
        ) : null}
        <YStack minWidth={0} $lg={{ flex: 1 }}>
          <ChatPanel projectId={projectId} />
        </YStack>
      </YStack>
    </YStack>
  );
}
