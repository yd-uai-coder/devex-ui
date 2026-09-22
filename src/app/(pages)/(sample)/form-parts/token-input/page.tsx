"use client";

import  TokenInput  from "@/components/ui/form/TokenInput";
import { Input, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";

export default function tokenInputPage() {
  return(
    <YStack maxWidth={800}>
      <Breadcrumb
        pageTitle="トークン入力(タグ付け)"
        description={"追加ボタン、またはEnterキーを押すと入力したテキストをトークンとして一覧に保持します。\n追加したテキストは✕ボタンで一覧から削除できます。"}
      />
      <TokenInput>
        <Input/>
      </TokenInput>
    </YStack>
  );
}
