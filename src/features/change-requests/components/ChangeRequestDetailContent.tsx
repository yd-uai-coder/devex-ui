"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, H2, Text, XStack, YStack } from "tamagui";
import { BaselineFreshnessNotice } from "@/features/baselines/components/BaselineFreshnessNotice";
import { useChangeRequestsStore } from "@/features/change-requests/change-requests-store";
import { type DetailTab, isApplied } from "@/features/change-requests/changeRequestOps";
import { ChangeRequestActions } from "@/features/change-requests/components/ChangeRequestActions";
import { ConflictNotice } from "@/features/change-requests/components/ConflictNotice";
import { ContentTab } from "@/features/change-requests/components/ContentTab";
import { DetailedModeOnlyNotice } from "@/features/change-requests/components/DetailedModeOnlyNotice";
import { ExplanationTab } from "@/features/change-requests/components/ExplanationTab";
import { ImpactTab } from "@/features/change-requests/components/ImpactTab";
import { ShareTab } from "@/features/change-requests/components/ShareTab";
import { StatusBadge } from "@/features/change-requests/components/StatusBadge";
import { TraceTab } from "@/features/change-requests/components/TraceTab";
import { VerificationTab } from "@/features/change-requests/components/VerificationTab";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

const TABS: { value: DetailTab; label: string }[] = [
  { value: "content", label: "内容" },
  { value: "impact", label: "影響" },
  { value: "verification", label: "検証" },
  { value: "explanation", label: "説明書" },
  { value: "share", label: "共有" },
  { value: "trace", label: "たどる記録" },
];

// 変更要求(CR)の詳細(SCR-010)。見出しに状態と操作(重なる CR の競合と、合意の前に基準の束が古ければ、その知らせ)、本文は6つのタブ(内容・影響・検証・説明書・共有・
// たどる記録)。開くタブは URL の ?tab= で選べる(?focus= は影響のタブで目立たせる要素)。タブの中身(予測・比較・検証・説明書・共有リンク・記録)は開いたときに読む。タブは選んだものだけを描く(入力中の
// フォームの状態を、親の再描画で失わないよう、部品を作り直さない)。文書への反映の完了待ちは、
// タブを移っても続くようにここで持ち、開いたときにプロジェクトが生成中なら待ち直す。
export function ChangeRequestDetailContent({
  projectId,
  number,
  initialTab = "content",
  focusKey = null,
}: {
  projectId: string;
  number: number;
  // URL で開くタブと、影響のタブの反映の前 → 後で目立たせる要素のキー(確認事項からのリンク)
  initialTab?: DetailTab;
  focusKey?: string | null;
}) {
  const detail = useChangeRequestsStore((s) => (s.projectId === projectId && s.detail?.number === number ? s.detail : null));
  const detailStatus = useChangeRequestsStore((s) => s.detailStatus);
  const detailError = useChangeRequestsStore((s) => s.detailError);
  const detailNotFound = useChangeRequestsStore((s) => s.detailNotFound);
  const unavailable = useChangeRequestsStore((s) => s.unavailable && s.projectId === projectId);
  const actionError = useChangeRequestsStore((s) => s.actionError);
  const reflecting = useChangeRequestsStore((s) => s.reflecting);
  const fetchDetail = useChangeRequestsStore((s) => s.fetchDetail);
  const onReflectionFinished = useChangeRequestsStore((s) => s.onReflectionFinished);
  const resumeReflection = useChangeRequestsStore((s) => s.resumeReflection);
  const [tab, setTab] = useState<DetailTab>(initialTab);

  useEffect(() => {
    void fetchDetail(projectId, number);
    void resumeReflection(projectId);
  }, [projectId, number, fetchDetail, resumeReflection]);

  const { timedOut } = useGenerationPolling(projectId, reflecting, (project) =>
    onReflectionFinished(projectId, number, project),
  );

  const back = (
    <Link href={`/projects/${projectId}/change-requests`}>
      <Text color="$blue10">← 変更要求の一覧</Text>
    </Link>
  );

  if (unavailable) return <DetailedModeOnlyNotice projectId={projectId} title={`CR-${number}`} />;
  if (detailNotFound) {
    return (
      <YStack paddingVertical="$4" gap="$3">
        <H2>{`CR-${number} は見つかりません`}</H2>
        {back}
      </YStack>
    );
  }

  return (
    <YStack paddingVertical="$4" gap="$4">
      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
        <XStack gap="$3" alignItems="center" flexWrap="wrap">
          <H2>{detail ? `${detail.label} ${detail.title}` : `CR-${number}`}</H2>
          {detail ? <StatusBadge status={detail.status} label={detail.status_label} /> : null}
        </XStack>
        <XStack gap="$3" alignItems="center">
          {back}
          <Link href={`/projects/${projectId}/detailed-design`}>
            <Text color="$blue10">詳細設計</Text>
          </Link>
        </XStack>
      </XStack>

      {detailStatus === "loading" && detail === null ? <Text color="$color11">読み込み中...</Text> : null}
      {detailStatus === "error" ? (
        <Text role="alert" color="$red10">
          {detailError}
        </Text>
      ) : null}

      {detail ? (
        <>
          <ChangeRequestActions projectId={projectId} cr={detail} />
          <ConflictNotice projectId={projectId} cr={detail} />
          {/* 合意の後は判断の時点の予測で組むので、束の鮮度は合意の前だけ知らせる */}
          {detail.decision === null ? (
            <BaselineFreshnessNotice
              projectId={projectId}
              freshness={detail.baseline_freshness}
              lead={`この CR の対象の文・説明書・規模は、基準の版 ${detail.baseline_label} の設計から求めています。`}
            />
          ) : null}
          {actionError ? (
            <Text role="alert" color="$red10">
              {actionError}
            </Text>
          ) : null}
          {reflecting && timedOut ? (
            <Text color="$color11">反映に時間がかかっています。しばらくしてから開き直してください。</Text>
          ) : null}

          <XStack gap="$2" role="tablist" flexWrap="wrap">
            {TABS.map((t) => (
              <Button
                key={t.value}
                size="$3"
                role="tab"
                aria-selected={tab === t.value}
                theme={tab === t.value ? "green" : undefined}
                chromeless={tab !== t.value}
                onPress={() => setTab(t.value)}
              >
                {t.label}
              </Button>
            ))}
          </XStack>
          <YStack role="tabpanel" padding="$3" borderWidth={1} borderColor="$borderColor" borderRadius="$4">
            {tab === "content" ? <ContentTab projectId={projectId} cr={detail} /> : null}
            {tab === "impact" ? <ImpactTab projectId={projectId} cr={detail} focusKey={focusKey} /> : null}
            {tab === "verification" ? (
              isApplied(detail.status) ? (
                <VerificationTab projectId={projectId} cr={detail} />
              ) : (
                <Text color="$color11">検証は、文書へ反映した後にできます。</Text>
              )
            ) : null}
            {tab === "explanation" ? <ExplanationTab projectId={projectId} cr={detail} /> : null}
            {tab === "share" ? <ShareTab projectId={projectId} cr={detail} /> : null}
            {tab === "trace" ? <TraceTab projectId={projectId} number={number} /> : null}
          </YStack>
        </>
      ) : null}
    </YStack>
  );
}
