"use client";

import { Accordion, type AccordionTriggerProps } from "tamagui";

export function StyledAccordionHeader({
  theme = "green",
  backgroundColor = "$color4",
  hoverStyle,
  pressStyle,
  width = "100%",
  flexDirection = "row",
  justifyContent = "space-between",
  alignItems = "center",
  borderWidth = 1,
  borderColor = "$borderColor",
  ...props
}: AccordionTriggerProps) {
  return (
    <Accordion.Header theme={theme}>
      <Accordion.Trigger
        backgroundColor={backgroundColor}
        hoverStyle={{ backgroundColor: "$color8", ...hoverStyle }}
        pressStyle={{ backgroundColor: "$color7", ...pressStyle }}
        width={width}
        flexDirection={flexDirection}
        justifyContent={justifyContent}
        alignItems={alignItems}
        borderWidth={borderWidth}
        borderColor={borderColor}
        {...props}
      />
    </Accordion.Header>
  );
}
