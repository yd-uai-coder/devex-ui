"use client";

import { useId, useState } from "react";
import type { SliderProps, SizeTokens } from "tamagui";
import { Label, Slider, Text, Theme, XStack, YStack } from "tamagui";
import { ClientOnly } from "@/components/ui/primitives/ClientOnly";
import { STATUS_THEME } from "./formStatus";
import type { FormStatus } from "./formStatus";

type SliderWithLabelProps = Omit<SliderProps, "children"> & {
  label?: string;
  labelWidth?: number | SizeTokens;
  unit?: string;
  size?: SizeTokens;
  thumbSize?: SizeTokens;
  status?: FormStatus;
  width?: number | SizeTokens;
};

export default function SliderWithLabel({
  label = "ラベル名",
  labelWidth,
  unit = "",
  size,
  thumbSize,
  status = "default",
  id,
  value,
  defaultValue = [50],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  width = 300,
  ...sliderProps
}: SliderWithLabelProps) {
  const generatedId = useId();
  const sliderId = id ?? generatedId;
  const isDisabled = status === "disabled";

  const [innerValue, setInnerValue] = useState(defaultValue);
  const currentValue = value ?? innerValue;

  const handleValueChange = (next: number[]) => {
    setInnerValue(next);
    onValueChange?.(next);
  };

  return (
    <Theme name={STATUS_THEME[status]}>
      <YStack width={width} gap="$2" marginBottom="$6">
        <XStack alignItems="center" justifyContent="space-between">
          <Label size={size} htmlFor={sliderId} width={labelWidth}>
            {label}
          </Label>
          <Text fontSize="$4">
            {currentValue[0]}
            {unit}
          </Text>
        </XStack>
        <ClientOnly>
          <Slider
            id={sliderId}
            size={size}
            disabled={isDisabled}
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onValueChange={handleValueChange}
            {...sliderProps}
          >
            <Slider.Track backgroundColor="$color4">
              <Slider.TrackActive backgroundColor="$color9" />
            </Slider.Track>
            <Slider.Thumb
              index={0}
              circular
              size={thumbSize}
              backgroundColor="$color9"
              borderColor="$color10"/>
          </Slider>
        </ClientOnly>
      </YStack>
    </Theme>
  );
}
