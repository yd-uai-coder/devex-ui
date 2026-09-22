"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import { applyRules, postalCode7Digits, postalCodeHyphenOptional } from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

function PostalCode7DigitsDemo() {
  const schema = z.object({ value: applyRules(z.string(), postalCode7Digits("郵便番号")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="7桁"
      description="ハイフンを含めたり、7桁以外で入力すると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="郵便番号"
            placeholder="1234567"
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

function PostalCodeHyphenAllowedDemo() {
  const schema = z.object({ value: applyRules(z.string(), postalCodeHyphenOptional("郵便番号")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="ハイフンあり可"
      description='"123-4567"のようにハイフンを含めても成功します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="郵便番号"
            placeholder="123-4567"
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

function PostalCodeNoHyphenAllowedDemo() {
  const schema = z.object({ value: applyRules(z.string(), postalCodeHyphenOptional("郵便番号")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="ハイフンなし可"
      description='"ハイフンあり可"と同じチェックです。"1234567"のようにハイフンを省略しても成功します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="郵便番号"
            placeholder="1234567"
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

export default function PostalCodeRules() {
  return (
    <>
      <PostalCode7DigitsDemo />
      <PostalCodeHyphenAllowedDemo />
      <PostalCodeNoHyphenAllowedDemo />
    </>
  );
}
