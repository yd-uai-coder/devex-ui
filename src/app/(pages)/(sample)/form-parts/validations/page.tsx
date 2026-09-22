"use client";

import { useState } from "react";
import { H3, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { LayoutTabs } from "@/components/ui/layout-blocks/LayoutTabs";
import CharacterTypeRules from "@/components/ui/form/validation/CharacterTypeRules";
import CheckboxRules from "@/components/ui/form/validation/CheckboxRules";
import CrossFieldRules from "@/components/ui/form/validation/CrossFieldRules";
import DateRules from "@/components/ui/form/validation/DateRules";
import EmailRules from "@/components/ui/form/validation/EmailRules";
import LengthRules from "@/components/ui/form/validation/LengthRules";
import NumberRules from "@/components/ui/form/validation/NumberRules";
import PasswordRules from "@/components/ui/form/validation/PasswordRules";
import PhoneRules from "@/components/ui/form/validation/PhoneRules";
import PostalCodeRules from "@/components/ui/form/validation/PostalCodeRules";
import RequiredRules from "@/components/ui/form/validation/RequiredRules";
import SelectRules from "@/components/ui/form/validation/SelectRules";

// 12カテゴリを1画面に縦積みすると長大になりすぎるため、LayoutTabsでカテゴリを切り替えられる
// ようにしている。ただし12個を1つのTabsに詰め込むとタブ自体が使いにくくなるため、
// 3ブロック(各4カテゴリ)に分けて、ブロックごとに独立したLayoutTabsを配置する。

export default function ValidationsPage() {
  const [basicTab, setBasicTab] = useState("必須チェック");
  const [formatTab, setFormatTab] = useState("日付");
  const [advancedTab, setAdvancedTab] = useState("パスワード");

  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="入力チェックルール確認"
        description={"必須・文字数・数値・日付・メール・電話番号・郵便番号・パスワード等、汎用バリデーションルールを1つずつ確認できるサンプルです。"}
      />

      <YStack gap="$3">
        <H3>基本ルール</H3>
        <LayoutTabs
          tabLabel={["必須チェック", "文字種類", "文字数", "数値"]}
          content={[RequiredRules, CharacterTypeRules, LengthRules, NumberRules]}
          value={basicTab}
          onValueChange={setBasicTab}
        />
      </YStack>

      <YStack gap="$3">
        <H3>書式ルール</H3>
        <LayoutTabs
          tabLabel={["日付", "メールアドレス", "電話番号", "郵便番号"]}
          content={[DateRules, EmailRules, PhoneRules, PostalCodeRules]}
          value={formatTab}
          onValueChange={setFormatTab}
        />
      </YStack>

      <YStack gap="$3">
        <H3>応用ルール</H3>
        <LayoutTabs
          tabLabel={["パスワード", "チェックボックス", "セレクトボックス", "クロスフィールド"]}
          content={[PasswordRules, CheckboxRules, SelectRules, CrossFieldRules]}
          value={advancedTab}
          onValueChange={setAdvancedTab}
        />
      </YStack>
    </YStack>
  );
}
