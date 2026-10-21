"use client";

import { useEffect } from "react";
import Link from "next/link";
import { H2, Paragraph, Text, XStack, YStack } from "tamagui";
import { ProjectNotFoundNotice } from "@/components/errors/ProjectNotFoundNotice";
import { useChangeRequestsStore } from "@/features/change-requests/change-requests-store";
import { ChangeRequestList } from "@/features/change-requests/components/ChangeRequestList";
import { DetailedModeOnlyNotice } from "@/features/change-requests/components/DetailedModeOnlyNotice";
import { baselinesHref } from "@/features/baselines/baselineOps";

// 変更要求(CR)の一覧(SCR-010。docs/external_design.md 2.14節)。詳細設計モードのプロジェクトだけ
// (簡易モードではサーバーが409を返し、本体の代わりに知らせを出す)。CR は合意済みの版を基準にするので、
// 作成は合意済みの版の中身のページから行う(基準の版はその版に固定。ここには作成を置かない)。
export function ChangeRequestsPageContent({ projectId }: { projectId: string }) {
  const list = useChangeRequestsStore((s) => s.list);
  const status = useChangeRequestsStore((s) => s.status);
  const error = useChangeRequestsStore((s) => s.error);
  const notFound = useChangeRequestsStore((s) => s.notFound && s.projectId === projectId);
  const unavailable = useChangeRequestsStore((s) => s.unavailable && s.projectId === projectId);
  const fetchList = useChangeRequestsStore((s) => s.fetchList);

  useEffect(() => {
    void fetchList(projectId);
  }, [projectId, fetchList]);

  if (notFound) return <ProjectNotFoundNotice />;
  if (unavailable) return <DetailedModeOnlyNotice projectId={projectId} title="変更要求(CR)" />;

  return (
    <YStack paddingVertical="$4" gap="$4">
      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
        <H2>変更要求(CR)</H2>
        <XStack gap="$3" alignItems="center">
          <Link href={`/projects/${projectId}/documents`}>
            <Text color="$blue10">← ドキュメント</Text>
          </Link>
          <Link href={`/projects/${projectId}/detailed-design`}>
            <Text color="$blue10">詳細設計</Text>
          </Link>
          <Link href={baselinesHref(projectId)}>
            <Text color="$blue10">合意済みの版</Text>
          </Link>
          <Link href={`/projects/${projectId}/confirmations`}>
            <Text color="$blue10">確認事項</Text>
          </Link>
        </XStack>
      </XStack>
      <Paragraph color="$color11">
        クライアントとの合意済みの版を基準に、変更の申し出を受け付けてから、説明・合意・反映・検証までを記録します。
      </Paragraph>
      <Text color="$color11">
        変更要求は、基準にする
        <Link href={baselinesHref(projectId)}>
          <Text color="$blue10">合意済みの版</Text>
        </Link>
        の中身のページから作ります。
      </Text>

      {status === "loading" && list.length === 0 ? <Text color="$color11">読み込み中...</Text> : null}
      {status === "error" ? (
        <Text role="alert" color="$red10">
          {error}
        </Text>
      ) : null}

      <ChangeRequestList projectId={projectId} items={list} />
    </YStack>
  );
}
