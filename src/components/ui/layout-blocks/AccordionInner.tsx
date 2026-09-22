"use client";
import type { ReactNode } from "react";
import { Accordion, Paragraph, Square, type FontSizeTokens } from "tamagui";
import { ChevronDown } from "lucide-react";
import { StyledAccordionHeader } from "@/components/ui/primitives/StyledAccordionHeader";

type AccordionInnerProps = {
  value:string,
  title:string,
  title_size?:FontSizeTokens,
  children: ReactNode;
};

export function AccordionInner({
  value,
  title,
  title_size,
  children,
}: AccordionInnerProps) {
  return(
    <Accordion.Item value={value} flex={1}>
      <StyledAccordionHeader>
        {({ open }: { open: boolean }) => (
          <>
            <Paragraph size={title_size}>
              {title}
            </Paragraph>
            <Square transparent transition="quick" rotate={open ? "180deg" : "0deg"}>
              <ChevronDown size={20} color="var(--color)" />
            </Square>
          </>
        )}
      </StyledAccordionHeader>
      <Accordion.HeightAnimator transition="300ms">
        <Accordion.Content
          transition="150ms"
          exitStyle={{ opacity: 0 }}
          borderWidth={1}
          borderTopWidth={0}
          borderColor="$borderColor"
          backgroundColor="$color3"
        >
          {children}
        </Accordion.Content>
      </Accordion.HeightAnimator>
    </Accordion.Item>
  );


}