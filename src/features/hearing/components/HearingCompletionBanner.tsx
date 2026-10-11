import { useState } from "react";
import { Button, Text, YStack } from "tamagui";
import { ConfirmDialog } from "@/components/ui/layout-blocks/ConfirmDialog";
import type { HearingCompletionCheck, HearingPoint } from "@/features/hearing/api/hearingApi";
import { useHearingStore } from "@/features/hearing/hearing-store";

type HearingCompletionBannerProps = {
  completion: HearingCompletionCheck;
  onApprove: () => void;
  approving: boolean;
  // 未決の任意の観点(観点の表から)。あれば一覧と「続ける」を出す
  optionalPoints?: HearingPoint[];
  // 「任意項目についてヒアリングを続ける」。続けている間も生成のボタンは出し続ける
  onContinueOptional?: () => void;
  // 送信中は「続ける」を押せない
  sending?: boolean;
};

// is_sufficient=trueでも即座に生成へは進まない。ユーザーの明示的な承認を得てから/generateを
// 呼ぶ(docs/external_design.md 2.3節)。まとめ(summary)は、同じ判定から作ったAIの返信として
// チャットに出るので、ここでは繰り返さない。必須がそろった時点で、未決の任意の観点を一覧にし、
// 生成するか、任意の観点のヒアリングを続けるかを選べるようにする(任意が残っていても生成できる)。
export function HearingCompletionBanner({
  completion,
  onApprove,
  approving,
  optionalPoints = [],
  onContinueOptional,
  sending = false,
}: HearingCompletionBannerProps) {
  const projectStatus = useHearingStore((s) => s.projectStatus);
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!completion.is_sufficient) return null;

  return (
    <YStack
      role="status"
      gap="$3"
      padding="$4"
      borderWidth={1}
      borderColor="$color8"
      borderRadius="$4"
      backgroundColor="$color2"
    >
      <Text fontWeight="600">必須項目の回答完了</Text>
      <Text>チャットの内容から設計書を生成できます。</Text>
      {optionalPoints.length > 0 ? (
        <YStack gap="$1">
          <Text fontWeight="600" fontSize="$3">
            任意の確認事項
          </Text>
          {optionalPoints.map((point) => (
            <Text key={point.key} fontSize="$2" color="$color11">
              ・{point.label}({point.question})
            </Text>
          ))}
        </YStack>
      ) : null}
      {/* 生成は数分かかり、やり直すとAIの利用枠も使うため、押す前に確認する */}
      <Button
        theme="green"
        disabled={projectStatus === "completed" || approving}
        onPress={() => setConfirmOpen(true)}
      >
        {projectStatus === "completed"
          ? "設計書は生成済みです"
          : approving
            ? "生成を開始しています..."
            : "この内容で設計書を生成する"}
      </Button>
      {optionalPoints.length > 0 && onContinueOptional && projectStatus !== "completed" ? (
        <Button disabled={sending || approving} onPress={onContinueOptional}>
          任意項目についてヒアリングを続ける
        </Button>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        title="設計書を生成しますか"
        description="この内容で設計書を生成します。生成には数分かかり、その間はチャットを送れません。"
        confirmLabel="生成する"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onApprove();
        }}
      />
    </YStack>
  );
}
