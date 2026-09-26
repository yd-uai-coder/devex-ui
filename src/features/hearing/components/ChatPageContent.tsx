"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { H2, Text, XStack, YStack } from "tamagui";
import { ChatPanel } from "@/features/hearing/components/ChatPanel";
import { useHearingStore } from "@/features/hearing/hearing-store";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

// POST /generateは202のみ返す(プッシュ通知が無い)ため、生成完了検知は
// useGenerationPolling(元はここに直接書かれていたが、ドキュメントプレビュー画面の
// 再生成でも同じロジックが必要になったため共通フックへ切り出した)に委ねる。
export function ChatPageContent({ projectId }: { projectId: string }) {
  const router = useRouter();
  const generationTriggered = useHearingStore((s) => s.generationTriggered);
  const projectStatus = useHearingStore((s) => s.projectStatus);

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
      <ChatPanel projectId={projectId} />
    </YStack>
  );
}
