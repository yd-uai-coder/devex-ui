"use client";
import { YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { AccordionExclusive } from "@/components/ui/layout-blocks/AccordionExclusive";
export default function AccordionSamplePage() {
  return (
    <YStack>
    <Breadcrumb
        pageTitle="アコーディオン"
        description="複数項目を同時に開ける独立モードと、1つだけ開く排他モードを切り替えられるアコーディオンのサンプルです。"
      />
      <AccordionExclusive/>
    </YStack>
  );
}
