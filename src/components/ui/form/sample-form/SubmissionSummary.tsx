"use client";

import { Text, YStack } from "tamagui";
import type { SampleFormValues } from "./sample-form-store";

const FIELD_LABELS: { key: keyof SampleFormValues; label: string }[] = [
  { key: "user", label: "名前" },
  { key: "mail", label: "メール" },
  { key: "password", label: "パスワード" },
  { key: "postCode", label: "郵便番号" },
  { key: "phonNum", label: "電話番号" },
  { key: "agree", label: "同意する" },
  { key: "animal", label: "好きな動物" },
  { key: "fruit", label: "好きな食べ物" },
  { key: "note", label: "その他" },
];

function formatValue(key: keyof SampleFormValues, values: SampleFormValues) {
  if (key === "password") {
    return values.password ? "•".repeat(values.password.length) : "(未入力)";
  }
  if (key === "agree") {
    return values.agree ? "同意する" : "同意しない";
  }
  const value = values[key];
  return value ? value : "(未入力)";
}

export function SubmissionSummary({ values }: { values: SampleFormValues }) {
  return (
    <YStack gap="$2">
      {FIELD_LABELS.map(({ key, label }) => (
        <Text key={key}>
          {label}: {formatValue(key, values)}
        </Text>
      ))}
    </YStack>
  );
}
