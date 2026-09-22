"use client";

import { useState } from "react";
import { H3, Input, TextArea, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { EditableTextField } from "@/components/ui/form/EditableTextField";

export default function EditableTextPage() {
  const [singleLineValue, setSingleLineValue] = useState("クリックして編集できます");
  const [multiLineValue, setMultiLineValue] = useState(
    "複数行の説明文です。\nクリックして編集できます。"
  );

  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="インライン編集フィールド"
        description={"クリックするとその場で編集できるテキストフィールドのサンプルです。\nもう1度クリックすると編集内容を保存します。"}
      />

      <YStack gap="$3">
        <H3>1行(改行不可)</H3>
        <EditableTextField value={singleLineValue} onValueChange={setSingleLineValue}>
          <Input width={320} />
        </EditableTextField>
      </YStack>

      <YStack gap="$3">
        <H3>複数行(Enterで改行可能)</H3>
        <EditableTextField value={multiLineValue} onValueChange={setMultiLineValue}>
          <TextArea width={320} />
        </EditableTextField>
      </YStack>
    </YStack>
  );
}
