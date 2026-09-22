"use client";

import { Text, XStack, YStack } from "tamagui";
import { useThemeSetting } from "@tamagui/next-theme";
import { useChartPalette } from "@/lib/theme-gradients";
import { useHasMounted } from "@/hooks/useHasMounted";

export type PieSlice = { label: string; value: number };

export function PieChart({
  slices,
  size = 110,
}: {
  slices: PieSlice[];
  size?: number;
}) {
  const themeSetting = useThemeSetting();
  const mounted = useHasMounted();
  // See Header.tsx: force the light-mode default until after hydration.
  const shades = useChartPalette(mounted ? themeSetting.resolvedTheme : undefined);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = size / 2;
  const strokeWidth = size * 0.28;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const offsets = slices.reduce<number[]>((acc, slice, index) => {
    acc.push(index === 0 ? 0 : acc[index - 1] + slices[index - 1].value);
    return acc;
  }, []);

  return (
    <XStack gap="$4" alignItems="center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice, index) => {
          const fraction = slice.value / total;
          const dash = fraction * circumference;
          const rotation = (offsets[index] / total) * 360 - 90;
          return (
            <circle
              key={slice.label}
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              fill="none"
              stroke={shades[index % shades.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              transform={`rotate(${rotation} ${radius} ${radius})`}
            />
          );
        })}
      </svg>
      <YStack gap="$2">
        {slices.map((slice, index) => (
          <XStack key={slice.label} alignItems="center" gap="$2">
            <YStack
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={shades[index % shades.length]}
            />
            <Text fontSize="$2" color="$color11">
              {slice.label}
            </Text>
          </XStack>
        ))}
      </YStack>
    </XStack>
  );
}
