"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Checkbox, Text, XStack, YStack } from "tamagui";

export function CheckListItem({
  title,
  description,
  defaultDone,
}: {
  title: string;
  description: string;
  defaultDone: boolean;
}) {
  const [done, setDone] = useState(defaultDone);

  return (
    <XStack gap="$3" alignItems="flex-start">
      <Checkbox
        checked={done}
        onCheckedChange={(checked) => setDone(checked === true)}
        size="$4"
        marginTop="$1"
      >
        <Checkbox.Indicator>
          <Check size={14} />
        </Checkbox.Indicator>
      </Checkbox>
      <YStack flex={1} gap="$1">
        <Text
          fontWeight="600"
          textDecorationLine={done ? "line-through" : "none"}
          color={done ? "$color9" : "$color12"}
        >
          {title}
        </Text>
        <Text
          fontSize="$2"
          color="$color9"
          textDecorationLine={done ? "line-through" : "none"}
        >
          {description}
        </Text>
      </YStack>
    </XStack>
  );
}
