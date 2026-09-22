"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Text, XStack, YStack,H1 } from "tamagui";
import { MENU_TREE } from "@/lib/menu-tree";

// ページヘッダー：左側に大きなタイトル、右側に「Home > グループ名 > pageTitle」のパンくずリスト。
// グループ名はusePathname()の現在URLがMENU_TREEのどのグループに属するかを検索して求める
// (グループ自体に対応するページは存在しないためリンクにはしない)。該当グループが見つからない
// 場合(ホームページ・404ページ等、MENU_TREEに含まれないパス)は中間の階層を表示しない。
// descriptionを渡すとその下にページの説明文を表示する(任意)。
// Tamaguiコンポーネントをレンダリングし、複数のServer Componentページから直接インポートされるため
// `'use client'`が必要です。
export function Breadcrumb({ pageTitle, description }: { pageTitle: string; description?: string }) {
  const pathname = usePathname();
  const currentGroup = MENU_TREE.find((group) =>
    group.children.some((leaf) => leaf.href === pathname),
  );

  return (
    <YStack gap="$2" marginBottom="$5">
      <XStack flexWrap="wrap" alignItems="center" justifyContent="space-between" gap="$3">
        <H1 fontSize="$7" fontWeight="700">
          {pageTitle}
        </H1>
        <XStack alignItems="center" flexWrap="wrap" gap="$1.5">
          <Text fontSize="$2" color="$color11">
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              Home
              <ChevronRight size={14} />
            </Link>
          </Text>
          {currentGroup ? (
            <XStack alignItems="center" gap={4}>
              <Text fontSize="$2" color="$color11">
                {currentGroup.label}
              </Text>
              <ChevronRight size={14} />
            </XStack>
          ) : null}
          <Text fontSize="$3">{pageTitle}</Text>
        </XStack>
      </XStack>
      {description ? (
        <Text fontSize="$4" color="$color11">
          {description}
        </Text>
      ) : null}
    </YStack>
  );
}
