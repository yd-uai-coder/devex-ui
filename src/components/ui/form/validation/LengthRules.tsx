"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import { applyRules, exactLength, lengthRange, maxLength, minLength } from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

function MinLengthDemo() {
  const schema = z.object({ value: applyRules(z.string(), minLength("値", 5)) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="最小文字数" description="5文字未満で確認すると失敗します。" {...ruleCheck}>
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="値"
            width="100%"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </RuleSection>
  );
}

function MaxLengthDemo() {
  const schema = z.object({ value: applyRules(z.string(), maxLength("値", 10)) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="最大文字数" description="10文字を超えて確認すると失敗します。" {...ruleCheck}>
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="値"
            width="100%"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </RuleSection>
  );
}

function ExactLengthDemo() {
  const schema = z.object({ value: applyRules(z.string(), exactLength("値", 7)) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="固定文字数"
      description="ちょうど7文字以外で確認すると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="値"
            width="100%"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </RuleSection>
  );
}

function LengthRangeDemo() {
  const schema = z.object({ value: applyRules(z.string(), lengthRange("値", 3, 8)) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="範囲指定"
      description="3〜8文字の範囲外で確認すると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="値"
            width="100%"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </RuleSection>
  );
}

export default function LengthRules() {
  return (
    <>
      <MinLengthDemo />
      <MaxLengthDemo />
      <ExactLengthDemo />
      <LengthRangeDemo />
    </>
  );
}
