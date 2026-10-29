"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, H2, H3, Paragraph, Text, XStack, YStack } from "tamagui";
import { ProjectNotFoundNotice } from "@/components/errors/ProjectNotFoundNotice";
import { changeRequestHref, changeRequestLabel } from "@/features/change-requests/changeRequestOps";
import { DetailedModeOnlyNotice } from "@/features/change-requests/components/DetailedModeOnlyNotice";
import { CELL, HEAD, MONO, TABLE } from "@/features/detailed-design/components/tableStyles";
import { MarkdownBody } from "@/features/documents/components/MarkdownBody";
import type { BaselineItemRead } from "@/features/baselines/api/types";
import { useBaselinesStore } from "@/features/baselines/baselines-store";
import { BaselineFreshnessNotice } from "@/features/baselines/components/BaselineFreshnessNotice";
import {
  baselinesHref,
  itemLabel,
  newChangeRequestHref,
  itemStateLabel,
  stageOfKey,
} from "@/features/baselines/baselineOps";

// 合意済みの版(束)の中身(SCR-010)。合意の記録・入れた変更要求・写した文書(md)・段階の表を出し、
// この版を基準に変更要求を作るページへ移れる。束が古ければ、作る前に知らせる。
// 段階の写し(model)の中身は出さない(重いため。詳細設計画面で今の段階を見る)
export function BaselineDetailContent({ projectId, number }: { projectId: string; number: number }) {
  const router = useRouter();
  const detail = useBaselinesStore((s) => (s.projectId === projectId && s.detail?.number === number ? s.detail : null));
  const detailStatus = useBaselinesStore((s) => s.detailStatus);
  const detailError = useBaselinesStore((s) => s.detailError);
  const detailNotFound = useBaselinesStore((s) => s.detailNotFound && s.projectId === projectId);
  const unavailable = useBaselinesStore((s) => s.unavailable && s.projectId === projectId);
  const fetchDetail = useBaselinesStore((s) => s.fetchDetail);
  const freshness = useBaselinesStore((s) =>
    s.projectId === projectId && s.freshness?.baseline_number === number ? s.freshness : null,
  );

  useEffect(() => {
    void fetchDetail(projectId, number);
  }, [projectId, number, fetchDetail]);

  if (detailNotFound) return <ProjectNotFoundNotice />;
  if (unavailable) return <DetailedModeOnlyNotice projectId={projectId} title="合意済みの版" />;

  const header = (
    <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
      <H2>{detail ? `${detail.label} 合意済みの版` : "合意済みの版"}</H2>
      <Link href={baselinesHref(projectId)}>
        <Text color="$blue10">← 合意済みの版の一覧</Text>
      </Link>
    </XStack>
  );
  if (!detail) {
    return (
      <YStack paddingVertical="$4" gap="$4">
        {header}
        {detailStatus === "error" ? (
          <Text role="alert" color="$red10">
            {detailError}
          </Text>
        ) : (
          <Text color="$color11">読み込み中...</Text>
        )}
      </YStack>
    );
  }

  const documents = detail.items.filter((i) => stageOfKey(i.key) === null);
  const stages = detail.items.filter((i) => stageOfKey(i.key) !== null);
  const included = detail.included_change_requests;

  return (
    <YStack paddingVertical="$4" gap="$4">
      {header}
      <BaselineFreshnessNotice
        projectId={projectId}
        freshness={freshness}
        lead={`この版を基準に変更要求を作ると、対象の要件の文・説明・規模は ${detail.label} の設計から求めます。`}
      />
      {freshness && !freshness.tracked ? (
        <Text color="$color11">
          この版は合意の記録を始める前に作ったので、後に反映した変更要求があるかは判定できません。
        </Text>
      ) : null}
      {/* 変更要求は、合意済みの版の中身から作る(基準の版はこの版に固定する) */}
      <XStack>
        <Button size="$3" theme="green" onPress={() => router.push(newChangeRequestHref(projectId, detail.number))}>
          この版を基準に変更要求を作る →
        </Button>
      </XStack>

      <YStack gap="$1">
        <H3>合意の記録</H3>
        <Text>合意の日時: {new Date(detail.agreed_at).toLocaleString("ja-JP")}</Text>
        <Text>相手: {detail.counterpart ?? "(記録なし)"}</Text>
        <Text whiteSpace="pre-wrap">理由: {detail.reason}</Text>
        {detail.memo ? <Text whiteSpace="pre-wrap">打ち合わせのメモ: {detail.memo}</Text> : null}
        <Text color="$color11">記録した日時: {new Date(detail.created_at).toLocaleString("ja-JP")}</Text>
      </YStack>

      <YStack gap="$1">
        <H3>入れた変更要求</H3>
        {included.length === 0 ? (
          <Text color="$color11">この版に入れた変更要求はありません。</Text>
        ) : (
          included.map((cr) => (
            <XStack key={cr.number} gap="$2" alignItems="center">
              <Link href={changeRequestHref(projectId, cr.number)}>
                <Text color="$blue10">{changeRequestLabel(cr.number)}</Text>
              </Link>
              <Text>{cr.title}</Text>
            </XStack>
          ))
        )}
      </YStack>

      <YStack gap="$2">
        <H3>写した文書</H3>
        {documents.map((item) => (
          <DocumentSnapshot key={item.key} item={item} />
        ))}
      </YStack>

      <YStack gap="$2">
        <H3>段階</H3>
        <Paragraph color="$color11" size="$2">
          入ったのは、作った時点で承認の写しがあった段階です。状態は作った時点のもの(承認の後に直した・古い、も含む)。
        </Paragraph>
        <table style={TABLE} aria-label="束の段階">
          <thead>
            <tr>
              <th style={HEAD}>段階</th>
              <th style={HEAD}>束に</th>
              <th style={HEAD}>作った時点の状態</th>
              <th style={HEAD}>承認した版</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((item) => (
              <tr key={item.key}>
                <td style={CELL}>{itemLabel(item.key)}</td>
                <td style={CELL}>{item.included ? "入った" : "入っていない"}</td>
                <td style={CELL}>{itemStateLabel(item)}</td>
                <td style={{ ...CELL, ...MONO }}>{item.source_version !== null ? `v${item.source_version}` : "─"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </YStack>
    </YStack>
  );
}

// 写した文書1つ。md は開いたときだけ描く(3つとも長いため)
function DocumentSnapshot({ item }: { item: BaselineItemRead }) {
  const [open, setOpen] = useState(false);
  const label = itemLabel(item.key);
  if (!item.included || item.content === null) {
    return (
      <Text color="$color11">
        {label}: {itemStateLabel(item)}(作った時点で無かった)
      </Text>
    );
  }
  return (
    <YStack gap="$2">
      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Text fontWeight="bold">{label}</Text>
        <Text color="$color11">
          {item.source_version !== null ? `v${item.source_version}` : ""}
          {item.generated_model ? ` ・${item.generated_model}` : ""}
        </Text>
        <Button size="$2" onPress={() => setOpen(!open)} aria-expanded={open}>
          {open ? `${label}を閉じる` : `${label}を見る`}
        </Button>
      </XStack>
      {open ? <MarkdownBody content={item.content} label={`${label}の写し`} /> : null}
    </YStack>
  );
}
