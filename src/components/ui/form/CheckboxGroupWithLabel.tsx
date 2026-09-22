"use client";

import { useId } from "react";
import type { SizeTokens } from "tamagui";
import { Label, Text, Theme, XStack, YStack } from "tamagui";
import { STATUS_THEME } from "./formStatus";
import type { FormStatus } from "./formStatus";
import { CheckboxGroup } from "./CheckboxGroup";
import type { CheckboxGroupOption } from "./CheckboxGroup";

type CheckboxGroupWithLabelProps = {
  errorMessage?: string;
  items: CheckboxGroupOption[];
  label?: string;
  labelWidth?: number | SizeTokens;
  name?: string;
  onValueChange?: (value: string[]) => void;
  size?: SizeTokens;
  status?: FormStatus;
  value?: string[];
  width?: number | SizeTokens;
};

export default function CheckboxGroupWithLabel({
  errorMessage,
  items,
  label = "ラベル名",
  labelWidth,
  name,
  onValueChange,
  size,
  status = "default",
  value = [],
  width = 300,
}: CheckboxGroupWithLabelProps) {
  const groupId = useId();
  const isDisabled = status === "disabled";
  const effectiveStatus = errorMessage ? "error" : status;

  return (
    <Theme name={STATUS_THEME[effectiveStatus]}>
      <YStack width={width} marginBottom="$3">
        <XStack
          flexDirection="column"
          alignItems="flex-start"
          gap="0"
          $md={{ flexDirection: "row", alignItems: "center", gap: "$4" }}
        >
          <Label size={size} id={groupId} flexShrink={0} $md={{ width: labelWidth }}>
            {label}
          </Label>
          <CheckboxGroup
            items={items}
            value={value}
            onValueChange={onValueChange}
            name={name}
            size={size}
            disabled={isDisabled}
            aria-labelledby={groupId}
            $md={{ flex: 1 }}
          />
        </XStack>
        {errorMessage ? (
          <Text color="$color9" fontSize="$2" marginTop="$1" $md={{ marginLeft: labelWidth }}>
            {errorMessage}
          </Text>
        ) : null}
      </YStack>
    </Theme>
  );
}
