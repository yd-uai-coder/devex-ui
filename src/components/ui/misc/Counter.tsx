"use client";

import { Button, H1, Text, XStack, YStack } from "tamagui";
import { useCounterStore } from "./counter-store";
import { StyledButton } from "@/components/ui/primitives/StyledButton";

export function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <YStack
      gap="$4"
      padding="$6"
      borderRadius="$6"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
      alignItems="center"
      minWidth={280}
    >
      <Text fontSize="$10">{count}</Text>
      <XStack gap="$3">
        <Button onPress={decrement}>-1</Button>
        <Button onPress={reset}>Reset</Button>
        <StyledButton onPress={increment}>+1</StyledButton>
      </XStack>
    </YStack>
  );
}
