"use client";

import { useState } from "react";
import { RadioGroup, Text, XStack, YStack } from "tamagui";

const PLANS = [
  { id: "personal", name: "Personal Plan", description: "Free!" },
  { id: "silver", name: "Silver Plan", description: "Exclusive features." },
  { id: "gold", name: "Gold Plan", description: "Priority support." },
];

export function RadioGroupCard() {
  const [selected, setSelected] = useState("personal");

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
          Subscribe
        </Text>
        <Text fontSize="$2" color="$color9">
          Select a plan
        </Text>
      </YStack>
      <RadioGroup value={selected} onValueChange={setSelected} gap="$2">
        {PLANS.map((plan) => (
          <XStack
            key={plan.id}
            alignItems="center"
            gap="$3"
            padding="$3"
            borderWidth={1}
            borderColor={selected === plan.id ? "$color9" : "$borderColor"}
            borderRadius="$4"
          >
            <RadioGroup.Item value={plan.id} id={plan.id} size="$4">
              <RadioGroup.Indicator />
            </RadioGroup.Item>
            <YStack>
              <Text fontWeight="600">{plan.name}</Text>
              <Text fontSize="$2" color="$color9">
                {plan.description}
              </Text>
            </YStack>
          </XStack>
        ))}
      </RadioGroup>
    </YStack>
  );
}
