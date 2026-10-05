"use client";

import { Text, YStack } from "tamagui";
import type { StageIssue } from "@/features/detailed-design/api/types";
import { visibleIssues } from "@/features/detailed-design/labels";

// 保存した内容の検証の結果(エラー・警告)の一覧。段階1・2のパネルで共有する。指摘が無ければ何も出さない。図の未承認は承認を押したときに
// 出すので、ここには出さない。
export function StageIssueList({ issues: all }: { issues: StageIssue[] }) {
  const issues = visibleIssues(all);
  if (issues.length === 0) return null;
  return (
    <YStack gap="$1" aria-label="検証の結果">
      <Text fontWeight="700">検証の結果(保存した内容)</Text>
      {issues.map((issue, index) => (
        <Text
          key={`${issue.code}-${issue.target ?? ""}-${index}`}
          color={issue.severity === "error" ? "$red10" : "$orange10"}
          fontSize="$2"
        >
          {issue.severity === "error" ? "エラー" : "警告"}: {issue.message}
        </Text>
      ))}
    </YStack>
  );
}
