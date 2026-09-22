"use client";

import type { ReactElement } from "react";
import { cloneElement, useMemo, useState } from "react";
import { Button, Popover, Text, YStack } from "tamagui";

type SuggestibleInputProps = {
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
};

export type InputSuggestProps = {
  /** サジェスト機能を付与する対象。<InputSimpleText>または生の<Input>を1つだけ渡す */
  children: ReactElement<SuggestibleInputProps>;
  /** サジェスト候補の全件リスト */
  suggestions: string[];
  /** 入力値が変化した(タイピング・候補選択いずれも)タイミングで呼ばれる */
  onValueChange?: (value: string) => void;
  /** ドロップダウンに表示する候補の最大件数(既定8) */
  maxSuggestions?: number;
};

/**
 * サジェスト検索用に文字列を正規化する。
 *
 * - 全角英数字 → 半角
 * - 半角カナ → 全角カナ
 * - カタカナ → ひらがな
 * - 英字は大文字小文字を区別しない
 */
function normalizeSuggestText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[ァ-ヶ]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60)
    )
    .toLowerCase();
}

// <InputSimpleText>・生の<Input>のどちらもラップできるよう、両者が共通して持つ
// value/onChangeText(TamaguiのInputProps由来)というプロトコルだけに依存している。
// 子要素の中身は関知せず、cloneElementでvalue/onChangeText/onFocusを注入するだけなので、
// 見た目(ラベルの有無・レイアウト)は子コンポーネント側の実装にそのまま委ねられる。
export function InputSuggest({ children, suggestions, onValueChange, maxSuggestions = 8 }: InputSuggestProps) {
  const [value, setValue] = useState(children.props.value ?? children.props.defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const normalizedSuggestions = useMemo(
    () =>
      suggestions.map((text) => ({
        original: text,
        normalized: normalizeSuggestText(text),
      })),
    [suggestions]
  );

  const filtered = useMemo(() => {
    const keyword = normalizeSuggestText(value);
    if (!keyword) {
      return [];
    }
    return normalizedSuggestions
      .filter((item) => item.normalized.startsWith(keyword))
      .slice(0, maxSuggestions)
      .map((item) => item.original);
  }, [value, normalizedSuggestions, maxSuggestions]);
    
  function handleChangeText(text: string) {
    setValue(text);
    onValueChange?.(text);
    children.props.onChangeText?.(text);
    setOpen(text.length > 0);
  }

  function selectSuggestion(suggestion: string) {
    setValue(suggestion);
    onValueChange?.(suggestion);
    setOpen(false);
  }

  // onFocus経由で「候補があれば再オープンする」処理も検討したが、Popoverが
  // クローズ時にフォーカスをトリガー(この入力欄自身)へ戻す既定挙動と衝突し、
  // クリックアウトサイド/Escapeで閉じた直後に即座に再オープンしてしまう不具合を
  // 実際に踏んだ(Playwrightで実測: クリックアウトサイド後もdata-state="open"のまま)。
  // そのため再オープンはタイピング(onChangeText)時のみに限定している。
  const clonedChild = cloneElement(children, {
    value,
    onChangeText: handleChangeText,
  });

  return (
    <Popover open={open && filtered.length > 0} onOpenChange={setOpen} placement="bottom-start">
      <Popover.Trigger asChild>{clonedChild}</Popover.Trigger>
      <Popover.Content
        zIndex={400}
        padding="$2"
        borderWidth={1}
        borderColor="$borderColor"
        elevation="$4"
        disableFocusScope
        // Popover.Contentは既定でbackgroundColorを持たずページ背景と同化するため
        // (DataFilter.tsxで実際に踏んだ既知不具合)、最初から明示指定している。
        backgroundColor="$color2"
      >
        <YStack gap="$1" minWidth={200}>
          {filtered.map((suggestion) => (
            <Button
              key={suggestion}
              chromeless
              justifyContent="flex-start"
              size="$3"
              onPress={() => selectSuggestion(suggestion)}
            >
              <Text>{suggestion}</Text>
            </Button>
          ))}
        </YStack>
      </Popover.Content>
    </Popover>
  );
}
