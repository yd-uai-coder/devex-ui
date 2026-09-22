"use client";

import type { ReactElement } from "react";
import { cloneElement, useState } from "react";
import { Popover, Text } from "tamagui";

type EditableInputProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
};

export type EditableTextFieldProps = {
  /** <Input>または<TextArea>を1つだけ渡す(1行/複数行を切り替えられる)。
   *  valueとdefaultValueはEditInPlaceField自身のpropで指定し、childrenには渡さないこと。 */
  children: ReactElement<EditableInputProps>;
  value?: string;
  defaultValue?: string;
  /** 「確定」ボタン押下時、またはクリックアウトサイド等で編集を終了した時に呼ばれる */
  onValueChange?: (value: string) => void;
  /** 値が空の場合に表示モードで示すプレースホルダー(既定空文字) */
  placeholder?: string;
  /** 確定ボタンのラベル(既定"確定") */
  confirmLabel?: string;
  width?: number | string;
};

export function EditableTextField({
  children,
  value,
  defaultValue,
  onValueChange,
  placeholder = "",
  width,
}: EditableTextFieldProps) {
  const [innerValue, setInnerValue] = useState(defaultValue ?? "");
  const currentValue = value ?? innerValue;

  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(currentValue);

  function startEditing() {
    setDraftValue(currentValue);
    setIsEditing(true);
  }

  function commit() {
    setInnerValue(draftValue);
    onValueChange?.(draftValue);
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <Text
        cursor="pointer"
        hoverStyle={{ backgroundColor: "$color3" }}
        paddingHorizontal="$2"
        paddingVertical="$1"
        borderRadius="$2"
        width={width}
        onPress={startEditing}
        color={currentValue ? undefined : "$color9"}
      >
        {currentValue || placeholder}
      </Text>
    );
  }

  const clonedChild = cloneElement(children, {
    value: draftValue,
    onChangeText: setDraftValue,
    autoFocus: true,
  });

  return (
    <Popover
      open={isEditing}
      onOpenChange={(open) => {
        // クリックアウトサイド・Escapeで閉じた場合も、確定ボタン押下と同様に下書きを確定する。
        // 確定ボタンはcommit()内でisEditingをfalseにする(このハンドラも連鎖して呼ばれるが、
        // draftValueは変化していないため再度commit()してもonValueChangeへ同じ値が渡るだけで無害)。
        if (!open) commit();
      }}
      placement="bottom-start"
    >
      <Popover.Trigger asChild>{clonedChild}</Popover.Trigger>
      <Popover.Content
        zIndex={400}
        padding="$2"
        borderWidth={1}
        borderColor="$borderColor"
        elevation="$4"
        disableFocusScope
        backgroundColor="$color2"
      >
      </Popover.Content>
    </Popover>
  );
}
