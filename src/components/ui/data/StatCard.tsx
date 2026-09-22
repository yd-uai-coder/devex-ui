"use client";

import type { ReactNode } from "react";
import { Separator, Text, YStack } from "tamagui";

export function StatCard({
  label,
  value,
  subtitle,
  children,
}: {
  label: string;
  value: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <YStack
      gap="$2"
      padding="$4"
      borderRadius="$6"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
    >
      <Text fontSize="$2" fontWeight="700" color="$color11" letterSpacing={1}>
        {label.toUpperCase()}
      </Text>
      <Text fontSize="$9" fontWeight="800">
        {value}
      </Text>
      <Text fontSize="$2" color="$color9">
        {subtitle}
      </Text>
      {children ? (
        <>
          <Separator marginVertical="$2" />
          {children}
        </>
      ) : null}
    </YStack>
  );
}
