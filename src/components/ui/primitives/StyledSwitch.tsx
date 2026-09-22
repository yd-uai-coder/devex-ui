"use client";

import { Switch, type SwitchProps } from "tamagui";

export function StyledSwitch({
  theme = "green",
  size = "$4",
  ...switchProps
}: SwitchProps) {
  return (
    <Switch
      theme={theme}
      size={size}
      activeStyle={{ backgroundColor: "$color9" }}
      {...switchProps}
    />
  );
}
