"use client";

import { Progress, Text, XStack, YStack } from "tamagui";
import { ClientOnly } from "@/components/ui/primitives/ClientOnly";

// 単一地域の統計のラベル付き行：コードバッジ + 名前/数（左側）、パーセンテージプログレスバー（右側）。
// Progressはクライアント側でレイアウトを測定するため、ClientOnlyでラップされており、
// そうでなければハイドレーションミスマッチが発生します。
export function RegionStatRow({
  code,
  name,
  target,
  percent,
}: {
  code: string;
  name: string;
  target: string;
  percent: number;
}) {
  // 達成率に応じてProgressの配色を切り替える(FormStatusのsuccess/warning/errorと
  // 同じgreen/yellow/redの考え方)。100%以上=green、80%以上=yellow、それ未満=red。
  const progressTheme = percent >= 100 ? "green" : percent >= 80 ? "yellow" : "red";

  return (
    <XStack alignItems="center" justifyContent="flex-start" gap="$3">
      <XStack alignItems="center" gap="$3">
        <YStack
          width={48}
          height={48}
          flexShrink={0}
          alignItems="center"
          justifyContent="center"
          borderRadius={999}
          backgroundColor="$green4"
        >
          <Text fontSize="$3" fontWeight="700" color="$green11">
            {code}
          </Text>
        </YStack>
        <YStack>
          <Text fontSize="$3" fontWeight="700">
            {name}
          </Text>
          <Text fontSize="$2" color="$color11">
            {target}
          </Text>
        </YStack>
      </XStack>

      <XStack alignItems="center" gap="$3" flex={1} maxWidth={160}>
        <ClientOnly>
          {/* Progress.Indicatorは内部で色スケールが反転したサブテーマ(t_xxx_ProgressIndicator)を
              持ち、そのスコープでの$color9(明るい側)がTrack側の$color4と同じ実色になり、
              達成部分と未達成部分が同色で塗りつぶされて見分けが付かなくなる不具合があった
              (実機のgetComputedStyleでtrackBg===indicatorBgを確認済み)。Trackの背景を$color9
              (Track側スコープでは彩度が高く暗めの色)にすることで、Indicator(明るい色=達成)と
              Track(暗い色=未達成)が確実に異なる色になるようにしている。 */}
          <Progress value={Math.min(percent, 100)} theme={progressTheme} backgroundColor="$color9" flex={1}>
            <Progress.Indicator backgroundColor="$color9" />
          </Progress>
        </ClientOnly>
        <Text fontSize="$3" fontWeight="600">
          {percent}%
        </Text>
      </XStack>
    </XStack>
  );
}
