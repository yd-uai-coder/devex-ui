"use client";

import { useState } from "react";
import { Accordion, Paragraph, YStack } from "tamagui";
import SwitchWithLabel from "@/components/ui/form/SwitchWithLabel";
import { AccordionInner } from "@/components/ui/layout-blocks/AccordionInner";

const accordionItems = (
  <>
    <AccordionInner
      value="a"
      title="アコーディオンA"
      title_size="$6"
      >
          <Paragraph>Aの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Aの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Aの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Aの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Aの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Aの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Aの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Aの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Aの内容です。ここにパネルの本文が入ります。</Paragraph>
    </AccordionInner>
    <AccordionInner
      value="b"
      title="アコーディオンB"
      title_size="$6"
      >
          <Paragraph>Bの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Bの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Bの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Bの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Bの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Bの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Bの内容です。ここにパネルの本文が入ります。</Paragraph>
    </AccordionInner>
    <AccordionInner
      value="c"
      title="アコーディオンC"
      title_size="$6"
      >
          <Paragraph>Cの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Cの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Cの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Cの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Cの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Cの内容です。ここにパネルの本文が入ります。</Paragraph>
          <Paragraph>Cの内容です。ここにパネルの本文が入ります。</Paragraph>
    </AccordionInner>
  </>
);

export function AccordionExclusive() {
  const [exclusive, setExclusive] = useState(false);
  const [singleValue, setSingleValue] = useState("a");
  const [multiValue, setMultiValue] = useState<string[]>(["a"]);

  return (
    <YStack paddingVertical="$4" gap="$6">
      <SwitchWithLabel
        label="片方を開くと片方が閉じる"
        checked={exclusive}
        onCheckedChange={setExclusive}
      />

      {exclusive ? (
        <Accordion
          overflow="hidden"
          type="single"
          collapsible
          value={singleValue}
          onValueChange={setSingleValue}
          orientation="horizontal"
          flexDirection="row"
          gap="$4"
        >
          {accordionItems}
        </Accordion>
      ) : (
        <Accordion
          overflow="hidden"
          type="multiple"
          value={multiValue}
          onValueChange={setMultiValue}
          orientation="horizontal"
          flexDirection="row"
          gap="$4"
        >
          {accordionItems}
        </Accordion>
      )}
    </YStack>
  );
}
