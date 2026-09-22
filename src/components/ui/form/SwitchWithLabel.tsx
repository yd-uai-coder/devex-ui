"use client";

import { useId } from "react";
import type { SizeTokens, SwitchProps } from "tamagui";
import { Label, Switch, Theme, XStack } from "tamagui";
import { STATUS_THEME } from "./formStatus";
import type { FormStatus } from "./formStatus";
import { StyledSwitch } from "@/components/ui/primitives/StyledSwitch";


type SwitchWithLabelProps = Omit<SwitchProps, "children"> & {
  label?: string;
  labelWidth?: number | SizeTokens;
  size?: SizeTokens;
  status?: FormStatus;
  width?: number | SizeTokens;
};

export default function SwitchWithLabel({
  label = "ラベル名",
  labelWidth,
  size = "$4",
  status = "default",
  id,
  width = 300,
  ...switchProps
}: SwitchWithLabelProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const isDisabled = status === "disabled";

  return (
    <Theme name={STATUS_THEME[status]}>
      <XStack width={width} alignItems="center" gap="$4" marginBottom="$6">
        <StyledSwitch
          id={switchId}
          theme="green"
          size={size}
          disabled={isDisabled}
          backgroundColor="$color4"
          activeStyle={{ backgroundColor: "$color9" }}
          {...switchProps}
        >
          <Switch.Thumb backgroundColor="$background" borderWidth={1} borderColor="$borderColor" />
        </StyledSwitch>
        <Label size={size} htmlFor={switchId} width={labelWidth}>
          {label}
        </Label>
      </XStack>
    </Theme>
  );
}
