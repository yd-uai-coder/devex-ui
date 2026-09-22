"use client";

import { useId } from "react";
import type { SizeTokens, TextAreaProps } from "tamagui";
import { Label, Text, TextArea, Theme, YStack } from "tamagui";
import { STATUS_THEME } from "./formStatus";
import type { FormStatus } from "./formStatus";

export type TextAreaWithLabelProps = TextAreaProps & {
  errorMessage?: string;
  label?: string;
  labelWidth?: number | SizeTokens;
  status?: FormStatus;
  width?: number | SizeTokens;
};

export default function TextAreaWithLabel({
  errorMessage,
  label = "ラベル名",
  labelWidth,
  placeholder = "プレースホルダ",
  status = "default",
  size,
  id,
  width = 300,
  ...textAreaProps
}: TextAreaWithLabelProps) {
  const generatedId = useId();
  const textAreaId = id ?? generatedId;
  const effectiveStatus = errorMessage ? "error" : status;

  return (
    <Theme name={STATUS_THEME[effectiveStatus]}>
      <YStack width={width} gap="0" marginBottom="$3">
        <Label size={size} htmlFor={textAreaId} width={labelWidth}>
          {label}
        </Label>
        <TextArea
          id={textAreaId}
          size={size}
          placeholder={placeholder}
          disabled={status === "disabled"}
          borderColor="$color7"
          {...textAreaProps}
        />
        {errorMessage ? (
          <Text color="$color9" fontSize="$2" marginTop="$1">
            {errorMessage}
          </Text>
        ) : null}
      </YStack>
    </Theme>
  );
}
