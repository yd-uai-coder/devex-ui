"use client";

import { useState } from "react";
import { H3, Paragraph, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { LayoutTabs } from "@/components/ui/layout-blocks/LayoutTabs";

function TabContentA() {
  return <Paragraph>タブAの内容です。</Paragraph>;
}
function TabContentB() {
  return <Paragraph>タブBの内容です。</Paragraph>;
}
function TabContentC() {
  return <Paragraph>タブCの内容です。</Paragraph>;
}

const TAB_LABELS = ["タブA", "タブB", "タブC"];
const TAB_CONTENTS = [TabContentA, TabContentB, TabContentC];

export default function LayoutTabsPage() {
  const [horizontalTab, setHorizontalTab] = useState(TAB_LABELS[0]);
  const [verticalTab, setVerticalTab] = useState(TAB_LABELS[0]);

  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="Tabsレイアウト"
        description="タブの横配置・縦配置を切り替えられるレイアウトのサンプルです。"
      />

      <YStack gap="$3">
        <H3>横配置(既定)</H3>
        <LayoutTabs
          tabLabel={TAB_LABELS}
          content={TAB_CONTENTS}
          value={horizontalTab}
          onValueChange={setHorizontalTab}
        />
      </YStack>

      <YStack gap="$3">
        <H3>縦配置</H3>
        <LayoutTabs
          tabLabel={TAB_LABELS}
          content={TAB_CONTENTS}
          value={verticalTab}
          onValueChange={setVerticalTab}
          orientation="vertical"
        />
      </YStack>
    </YStack>
  );
}
