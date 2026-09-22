"use client";

import { Button, type ButtonProps } from "tamagui";

export function StyledButton({
  theme = "green",
  backgroundColor = "$color9",
  color = "white",
  hoverStyle,
  pressStyle,
  ...props
}: ButtonProps) {
  return (
    <Button
      theme={theme}
      backgroundColor={backgroundColor}
      color={color}
      hoverStyle={{ backgroundColor: "$color10", ...hoverStyle }}
      pressStyle={{ backgroundColor: "$color8", ...pressStyle }}
      {...props}
    />
  );
}
