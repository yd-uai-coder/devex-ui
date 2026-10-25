"use client";

import { H4, YStack } from "tamagui";
import type { ChangeRequestRead } from "@/features/change-requests/api/types";
import { CommentThread } from "@/features/change-requests/components/CommentThread";
import { ShareLinkPanel } from "@/features/change-requests/components/ShareLinkPanel";

// 詳細の「共有」タブ。クライアントとのすり合わせに使う共有リンクと、リンクから届いたコメント・返信を扱う
export function ShareTab({ projectId, cr }: { projectId: string; cr: ChangeRequestRead }) {
  return (
    <YStack gap="$4">
      <YStack gap="$2">
        <H4>共有リンク</H4>
        <ShareLinkPanel projectId={projectId} cr={cr} />
      </YStack>
      <YStack gap="$2">
        <H4>コメント</H4>
        <CommentThread projectId={projectId} cr={cr} />
      </YStack>
    </YStack>
  );
}
