"use client";

import { useState } from "react";
import { z } from "zod";
import { ListItem, Text, XStack, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { Column } from "@/components/ui/primitives/Column";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import { InputSuggest } from "@/components/ui/form/InputSuggest";
import { applyRules, maxLength, requiredText } from "@/lib/schemas/validation-rules";

const KEYWORD_MAX_LENGTH = 10;
const keywordSchema = applyRules(
  z.string(),
  requiredText("キーワード"),
  maxLength("キーワード", KEYWORD_MAX_LENGTH),
);

function validateKeyword(value: string): string | undefined {
  const result = keywordSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function SuggestDemo({ suggestions }: { suggestions: string[] }) {
  const [simpleValue, setSimpleValue] = useState("");
  const [simpleTouched, setSimpleTouched] = useState(false);

  const simpleError = simpleTouched ? validateKeyword(simpleValue) : undefined;

  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="入力サジェスト"
        description="入力候補をドロップダウンで表示するサジェスト(オートコンプリート)入力欄のサンプルです。"
      />
      <XStack  flexDirection="column" $md={{ flexDirection: "row",justifyContent:"center" }} gap="$2">
        <Column>
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="700">
              候補リストの言葉を入力してください
            </Text>
            <InputSuggest suggestions={suggestions} onValueChange={setSimpleValue}>
              <InputSimpleText
                label="キーワード"
                placeholder="例: ラーメン"
                labelWidth={100}
                onBlur={() => setSimpleTouched(true)}
                errorMessage={simpleError}
              />
            </InputSuggest>
            <Text color="$color9" fontSize="$2">
              現在の値: {simpleValue || "(未入力)"}
            </Text>
          </YStack>
        </Column>
        <Column>
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="700">
              候補リスト
            </Text>
            <YStack
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$4"
              maxHeight={320}
              overflow="scroll"
            >
              {suggestions.map((suggestion) => (
                <ListItem key={suggestion} title={suggestion} />
              ))}
            </YStack>
          </YStack>
        </Column>
      </XStack>
    </YStack>
  );
}
