"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { H2, Text, XStack, YStack, useMedia } from "tamagui";
import { ChatPanel } from "@/features/hearing/components/ChatPanel";
import { HearingPointsPanel } from "@/features/hearing/components/HearingPointsPanel";
import { useHearingStore } from "@/features/hearing/hearing-store";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

// POST /generateは202のみ返す(プッシュ通知が無い)ため、生成完了検知は
// useGenerationPolling(ドキュメントプレビュー画面の再生成と共有)に委ねる。
export function ChatPageContent({ projectId }: { projectId: string }) {
  const router = useRouter();
  const generationTriggered = useHearingStore((s) => s.generationTriggered);
  const projectStatus = useHearingStore((s) => s.projectStatus);
  const points = useHearingStore((s) => s.points);
  // 広い画面(lg 以上)は観点の表をチャットの右に開いて置き、狭い画面はチャットの上に畳んで置く
  const wide = useMedia().lg;

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
          <YStack $lg={{ width: 460, flexShrink: 0 }}>
            {/* 幅が変わって置き場所が変わったら、開閉の初期値を合わせ直す */}
            <HearingPointsPanel key={wide ? "wide" : "narrow"} view={points} defaultOpen={wide} />
          </YStack>
        ) : null}
        <YStack minWidth={0} $lg={{ flex: 1 }}>
          <ChatPanel projectId={projectId} />
        </YStack>
      </YStack>
    </YStack>
  );
}
