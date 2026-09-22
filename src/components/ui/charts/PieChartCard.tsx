"use client";

import { Separator, Text, YStack } from "tamagui";
import { PieChart } from "@/components/ui/charts/PieChart";
import type { PieSlice } from "@/components/ui/charts/PieChart";

export function PieChartCard({ slices }: { slices: PieSlice[] }) {
  return (
    <YStack
      gap="$2"
      padding="$4"
      borderRadius="$6"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
    >
      <Text fontSize="$5" fontWeight="700">
        Traffic Sources
      </Text>
      <Text fontSize="$2" color="$color9">
        Organic and non-organic
      </Text>
      <Separator marginVertical="$2" />
      <PieChart slices={slices} />
    </YStack>
  );
}
