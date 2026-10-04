"use client";

import { useState, type ComponentType } from "react";
import { H3, Paragraph, Text, XStack, YStack } from "tamagui";
import { StyledButton } from "@/components/ui/primitives/StyledButton";
import type { DesignStageRead } from "@/features/detailed-design/api/types";
import { DataFlowPanel } from "@/features/detailed-design/components/DataFlowPanel";
import { DataModelPanel } from "@/features/detailed-design/components/DataModelPanel";
import { FunctionListPanel } from "@/features/detailed-design/components/FunctionListPanel";
import {
  canApprove,
  describeMissingInput,
  STAGE_TITLES,
  STATE_LABELS,
} from "@/features/detailed-design/labels";

// 段階ごとの中身のパネルが受け取る値(どの段階のパネルも同じ形にする)。
type StagePanelProps = {
  projectId: string;
  stage: DesignStageRead;
  onDirtyChange: (dirty: boolean) => void;
};

// 段階番号 → その段階の中身のパネル。登録の無い段階は「準備中」を出す(段階4以降は各段階の Phase で足す)。
const STAGE_PANELS: Partial<Record<number, ComponentType<StagePanelProps>>> = {
  1: FunctionListPanel,
  2: DataFlowPanel,
  3: DataModelPanel,
};

// 選んだ段階の作業領域。全段階に共通の部分(状態・足りない入力・古い表示・承認)を持ち、
// 段階ごとの中身(下書きの生成・表や図の編集)は STAGE_PANELS に登録したパネルが持つ。
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
  const Panel = stage.is_open ? STAGE_PANELS[stage.stage] : undefined;
  const hasPanel = Panel !== undefined;

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

      {Panel ? (
        <Panel
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
