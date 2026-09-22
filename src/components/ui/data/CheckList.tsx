"use client";

import { Text, YStack } from "tamagui";
import { CheckListItem } from "@/components/ui/data/CheckListItem";

const TASKS = [
  {
    title: "Migrate to the new version",
    description: "Lorem ipsum dolor sit amet consectetur.",
    defaultDone: false,
  },
  {
    title: "Make a tabs component",
    description: "Lorem ipsum dolor sit amet consectetur.",
    defaultDone: true,
  },
  {
    title: "Implement the design system",
    description: "Lorem ipsum dolor sit amet consectetur.",
    defaultDone: true,
  },
];

export function CheckList() {
  return (
    <YStack
      gap="$3"
      padding="$4"
      borderRadius="$6"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
    >
      <YStack gap="$1">
        <Text fontSize="$5" fontWeight="700">
          Tasks
        </Text>
        <Text fontSize="$2" color="$color9">
          Active task for your team
        </Text>
      </YStack>
      <YStack gap="$3">
        {TASKS.map((task) => (
          <CheckListItem key={task.title} {...task} />
        ))}
      </YStack>
    </YStack>
  );
}
