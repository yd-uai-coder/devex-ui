"use client";

import type { ReactElement } from "react";
import { cloneElement, useState } from "react";
import { Form, YStack } from "tamagui";
import { StyledButton } from "@/components/ui/primitives/StyledButton";

import TokenField from "@/components/ui/form/TokenField";

type TokenInputChildProps = {
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
};

type TokenInputProps = {
  /** InputSimpleText や Tamagui の Input を1つ渡す */
  children: ReactElement<TokenInputChildProps>;
  /** 追加前の入力チェック */
  onBeforeSubmit?: () => boolean | Promise<boolean>;
};

export default function TokenInput({
  children,
  onBeforeSubmit,
}: TokenInputProps) {
  // 入力中の文字列
  const [inputValue, setInputValue] = useState(
    children.props.value ?? children.props.defaultValue ?? ""
  );

  // 登録済みトークン
  const [tokens, setTokens] = useState<string[]>([]);

  function addToken() {
    const text = inputValue.trim();

    if (!text) return;
    if (tokens.includes(text)) return;

    setTokens((prev) => [...prev, text]);
    setInputValue("");
  }

  function removeToken(value: string) {
    setTokens((prev) => prev.filter((token) => token !== value));
  }

  // 子のInputへvalueとonChangeTextを注入
  const clonedChild = cloneElement(children, {
    value: inputValue,
    onChangeText: setInputValue,
  });

  return (
    <YStack gap="$4">
      <Form
        gap="$2"
        borderWidth={1}
        borderRadius="$4"
        padding="$6"
        onSubmit={async () => {
          if (onBeforeSubmit) {
            const ok = await onBeforeSubmit();
            if (!ok) return;
          }

          addToken();
        }}
      >
        {clonedChild}

        <Form.Trigger asChild>
          <StyledButton>
            追加
          </StyledButton>
        </Form.Trigger>
      </Form>

      <TokenField
        tokens={tokens}
        onRemove={removeToken}
      />
    </YStack>
  );
}