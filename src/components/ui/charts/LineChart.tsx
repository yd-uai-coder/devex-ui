"use client";

import { Text, XStack, YStack } from "tamagui";

export function LineChart({
  values,
  width = 240,
  height = 60,
  color = "currentColor",
  labels,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  labels?: string[];
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <YStack gap="$1">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block", width: "100%", height }}
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {labels ? (
        <XStack gap="$2">
          {labels.map((label, index) => (
            <Text key={index} flex={1} fontSize="$1" color={color} opacity={0.75} textAlign="center">
              {label}
            </Text>
          ))}
        </XStack>
      ) : null}
    </YStack>
  );
}
