"use client";

import { useState } from "react";
import { Accordion, H2, YStack } from "tamagui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AccordionInner } from "@/components/ui/layout-blocks/AccordionInner";
import { AccountSection } from "@/features/mypage/components/AccountSection";
import { ApiKeySection } from "@/features/mypage/components/ApiKeySection";
import { ModelSection } from "@/features/mypage/components/ModelSection";

// マイページ(SCR-009)。アカウント・用途ごとのモデル・provider ごとの API キーの3つの節を、
// 1つを開くとほかが閉じるアコーディオンに並べる(初めはアカウント)。閉じた節の中身は外れ、
// 開くたびに読み直す(API キーの節で登録・削除した後にモデルの節を開けば、選べる AI が新しくなる)。
// 閉じると、保存していない編集は消える。
export default function MyPage() {
  const [openSection, setOpenSection] = useState("account");

  return (
    <RequireAuth>
      <YStack paddingVertical="$4" gap="$6" width="100%" maxWidth={640}>
        <H2>マイページ</H2>
        <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection} gap="$3">
          <AccordionInner value="account" title="アカウント" title_size="$6" flex="unset">
            <AccountSection />
          </AccordionInner>
          <AccordionInner value="models" title="モデル" title_size="$6" flex="unset">
            <ModelSection />
          </AccordionInner>
          <AccordionInner value="api-keys" title="API キー" title_size="$6" flex="unset">
            <ApiKeySection />
          </AccordionInner>
        </Accordion>
      </YStack>
    </RequireAuth>
  );
}
