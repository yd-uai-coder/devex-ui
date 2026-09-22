"use client";

import { Text, YStack } from "tamagui";
import { useThemeSetting } from "@tamagui/next-theme";
import { LineChart } from "@/components/ui/charts/LineChart";
import { useBlueGreenGradientVivid } from "@/lib/theme-gradients";
import { useHasMounted } from "@/hooks/useHasMounted";

type LineChartCardProps = {
  label_name: string;
  label_value: string;
  chart_values: number[];
  labels?: string[];
};

export function LineChartCard({
  label_name,
  label_value,
  chart_values,
  labels,
}: LineChartCardProps) {
  const themeSetting = useThemeSetting();
  const mounted = useHasMounted();
  const gradient = useBlueGreenGradientVivid(
    mounted ? themeSetting.resolvedTheme : undefined
  );

  return (
    <YStack
      gap="$2"
      padding="$4"
      borderRadius="$6"
      style={{ backgroundImage: gradient }}
    >
      <Text
        fontSize="$2"
        fontWeight="700"
        color="white"
        opacity={0.85}
        letterSpacing={1}
      >
        {label_name}
      </Text>
      <Text fontSize="$9" fontWeight="800" color="white">
        {label_value}
      </Text>
      <Text fontSize="$2" color="white" opacity={0.75}>
        The past 6 months
      </Text>
      <YStack marginTop="$2">
        <LineChart values={chart_values} height={60} color="white" labels={labels} />
      </YStack>
    </YStack>
  );
}
