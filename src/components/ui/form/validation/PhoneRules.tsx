"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import {
  applyRules,
  digitsOnlyPhone,
  internationalPhoneFormat,
  japanesePhoneFormat,
  phoneHyphenAllowed,
} from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

function DigitsOnlyPhoneDemo() {
  const schema = z.object({ value: applyRules(z.string(), digitsOnlyPhone("電話番号")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="数字のみ"
      description="ハイフンを含めたり、10〜11桁以外で入力すると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="電話番号"
            placeholder="09012345678"
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

function PhoneHyphenAllowedDemo() {
  const schema = z.object({ value: applyRules(z.string(), phoneHyphenAllowed("電話番号")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="ハイフン可"
      description="ハイフンありなしどちらの形式でも成功します。それ以外の形式は失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="電話番号"
            placeholder="090-1234-5678"
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

function JapanesePhoneFormatDemo() {
  const schema = z.object({ value: applyRules(z.string(), japanesePhoneFormat("電話番号")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="日本形式"
      description='"0X-XXXX-XXXX"形式でないと失敗します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="電話番号"
            placeholder="03-1234-5678"
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

function InternationalPhoneFormatDemo() {
  const schema = z.object({ value: applyRules(z.string(), internationalPhoneFormat("電話番号")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="国際形式"
      description='"+"から始まる国際電話番号形式でないと失敗します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="電話番号"
            placeholder="+81-9012345678"
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

export default function PhoneRules() {
  return (
    <>
      <DigitsOnlyPhoneDemo />
      <PhoneHyphenAllowedDemo />
      <JapanesePhoneFormatDemo />
      <InternationalPhoneFormatDemo />
    </>
  );
}
