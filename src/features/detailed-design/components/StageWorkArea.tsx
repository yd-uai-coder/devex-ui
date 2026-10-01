"use client";

import { useState } from "react";
import { H3, Paragraph, Text, XStack, YStack } from "tamagui";
import { StyledButton } from "@/components/ui/primitives/StyledButton";
import type { DesignStageRead } from "@/features/detailed-design/api/types";
import { FunctionListPanel } from "@/features/detailed-design/components/FunctionListPanel";
import {
  canApprove,
  describeMissingInput,
  STAGE_TITLES,
  STATE_LABELS,
} from "@/features/detailed-design/labels";

// 選んだ段階の作業領域。全段階に共通の部分(状態・足りない入力・古い表示・承認)を持ち、
// 段階ごとの中身(下書きの生成・表や図の編集)は段階の実装で足す(Phase 16 は段階1)。
export function StageWorkArea({
  projectId,
  stage,
  approving,
  actionError,
  onApprove,
}: {
  projectId: string;
  stage: DesignStageRead;
  approving: boolean;
  actionError: string | null;
  onApprove: () => void;
}) {
  // 段階の中身に保存していない編集があるか。あるうちは承認させない(承認されるのは保存済みの版のため)
  const [dirty, setDirty] = useState(false);
  const hasPanel = stage.stage === 1 && stage.is_open;

  return (
    <YStack flex={1} gap="$3">
      <H3>
        段階{stage.stage} {STAGE_TITLES[stage.stage]}
      </H3>
      <Text color="$color11">状態: {STATE_LABELS[stage.state]}</Text>

      {!stage.is_open ? (
        <Paragraph color="$color11">
          この段階はまだ始められません。先に次のものが必要です:{" "}
          {stage.missing_inputs.map(describeMissingInput).join("、")}
        </Paragraph>
      ) : null}

      {stage.state === "outdated" ? (
        <Paragraph role="status" color="$red10">
          この段階を作った・承認した後に、入力(前の段階または文書)が変わりました。作り直すか、
          内容を確かめてこのまま承認し直してください。
        </Paragraph>
      ) : null}

      {hasPanel ? (
        <FunctionListPanel
          // 保存・生成で版や生成の状態が変わったら作り直し、編集中の内容をサーバーの内容に戻す
          key={`${stage.version}-${stage.generation_status}`}
          projectId={projectId}
          stage={stage}
          onDirtyChange={setDirty}
        />
      ) : (
        <YStack
          padding="$4"
          borderWidth={1}
          borderStyle="dashed"
          borderColor="$borderColor"
          borderRadius="$4"
        >
          <Text color="$color11">
            {stage.is_open
              ? "この段階の下書きの生成と編集の画面は、準備中です。"
              : "前の段階を承認すると、この段階を始められます。"}
          </Text>
        </YStack>
      )}

      {actionError ? (
        <Text role="alert" color="$red10">
          {actionError}
        </Text>
      ) : null}

      <XStack justifyContent="flex-end" alignItems="center" gap="$3">
        {hasPanel && dirty ? (
          <Text color="$color11" fontSize="$2">
            保存してから承認してください。
          </Text>
        ) : null}
        <StyledButton
          disabled={!canApprove(stage) || approving || (hasPanel && dirty)}
          onPress={onApprove}
        >
          {approving
            ? "承認しています..."
            : stage.state === "outdated"
              ? "このまま承認し直す"
              : "承認する"}
        </StyledButton>
      </XStack>
    </YStack>
  );
}
