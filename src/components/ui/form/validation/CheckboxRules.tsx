"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import CheckboxGroupWithLabel from "@/components/ui/form/CheckboxGroupWithLabel";
import { CheckboxWithLabel } from "@/components/ui/form/CheckboxWithLabel";
import { applyRules, atLeastOneSelected, maxSelected, requiredTrue } from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

const HOBBY_ITEMS = [
  { value: "reading", label: "読書" },
  { value: "sports", label: "スポーツ" },
  { value: "music", label: "音楽" },
  { value: "travel", label: "旅行" },
];

function RequiredCheckboxDemo() {
  const schema = z.object({ agree: requiredTrue("チェックしてください") });
  const { control, ...ruleCheck } = useRuleCheck(schema, { agree: false });
  return (
    <RuleSection
      title="チェック必須"
      description="チェックを入れずに確認すると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="agree"
        control={control}
        render={({ field, fieldState }) => (
          <CheckboxWithLabel
            label="同意する"
            width="100%"
            checked={field.value}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </RuleSection>
  );
}

function AtLeastOneSelectedDemo() {
  const schema = z.object({
    selected: applyRules(z.array(z.string()), atLeastOneSelected("趣味")),
  });
  const { control, ...ruleCheck } = useRuleCheck(schema, { selected: [] });
  return (
    <RuleSection
      title="1件以上選択"
      description="1件も選択せずに確認すると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="selected"
        control={control}
        render={({ field, fieldState }) => (
          <CheckboxGroupWithLabel
            items={HOBBY_ITEMS}
            label="趣味"
            width="100%"
            value={field.value}
            onValueChange={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </RuleSection>
  );
}

function MaxSelectedDemo() {
  const schema = z.object({
    selected: applyRules(z.array(z.string()), maxSelected("趣味", 2)),
  });
  const { control, ...ruleCheck } = useRuleCheck(schema, { selected: [] });
  return (
    <RuleSection title="最大○件" description="3件以上選択すると失敗します(上限2件)。" {...ruleCheck}>
      <Controller
        name="selected"
        control={control}
        render={({ field, fieldState }) => (
          <CheckboxGroupWithLabel
            items={HOBBY_ITEMS}
            label="趣味"
            width="100%"
            value={field.value}
            onValueChange={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </RuleSection>
  );
}

export default function CheckboxRules() {
  return (
    <>
      <RequiredCheckboxDemo />
      <AtLeastOneSelectedDemo />
      <MaxSelectedDemo />
    </>
  );
}
