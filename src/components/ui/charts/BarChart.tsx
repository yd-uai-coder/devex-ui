"use client";

import { Text, XStack, YStack } from "tamagui";

export function BarChart({
  values,
  height = 80,
  labels,
}: {
  values: number[];
  height?: number;
  labels?: string[];
}) {
  const max = Math.max(...values, 1);

  return (
    <YStack gap="$1">
      <XStack gap="$2" alignItems="flex-end" height={height}>
        {values.map((value, index) => (
          <YStack
            key={index}
            flex={1}
            height={Math.max(4, Math.round((value / max) * height))}
            backgroundColor="$color8"
            theme="blue"
            borderRadius="$2"
          />
        ))}
      </XStack>
      {labels ? (
        <XStack gap="$2">
          {labels.map((label, index) => (
            <Text key={index} flex={1} fontSize="$1" color="$color9" textAlign="center">
              {label}
            </Text>
          ))}
        </XStack>
      ) : null}
    </YStack>
  );
}
