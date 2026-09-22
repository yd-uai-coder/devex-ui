"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import DatePickerWithLabel from "@/components/ui/form/DatePickerWithLabel";
import InputEmail from "@/components/ui/form/InputEmail";
import InputPassword from "@/components/ui/form/InputPassword";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import { applyRules, dateRangeValid, fieldsMatch, numberRangeValid } from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

function PasswordMatchDemo() {
  const schema = applyRules(
    z.object({ password: z.string(), confirm: z.string() }),
    fieldsMatch("password", "confirm", "パスワードが一致しません"),
  );
  const { control, ...ruleCheck } = useRuleCheck(schema, { password: "", confirm: "" });
  return (
    <RuleSection
      title="パスワード一致"
      description="パスワードと確認用パスワードが異なると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <InputPassword
            label="パスワード"
            width="100%"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="confirm"
        control={control}
        render={({ field, fieldState }) => (
          <InputPassword
            label="確認用パスワード"
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

function EmailMatchDemo() {
  const schema = applyRules(
    z.object({ mail: z.string(), confirm: z.string() }),
    fieldsMatch("mail", "confirm", "メールアドレスが一致しません"),
  );
  const { control, ...ruleCheck } = useRuleCheck(schema, { mail: "", confirm: "" });
  return (
    <RuleSection
      title="メール確認一致"
      description="メールアドレスと確認用メールアドレスが異なると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="mail"
        control={control}
        render={({ field, fieldState }) => (
          <InputEmail
            label="メール"
            width="100%"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="confirm"
        control={control}
        render={({ field, fieldState }) => (
          <InputEmail
            label="確認用メール"
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

function DateRangeDemo() {
  const schema = applyRules(
    z.object({ start: z.string(), end: z.string() }),
    dateRangeValid("start", "end", "開始日は終了日以前の日付にしてください"),
  );
  const { control, ...ruleCheck } = useRuleCheck(schema, { start: "", end: "" });
  return (
    <RuleSection
      title="開始日≤終了日"
      description="開始日より前の終了日を選ぶと失敗します(日付カテゴリの「開始日≦終了日」と同じチェックです)。"
      {...ruleCheck}
    >
      <Controller
        name="start"
        control={control}
        render={({ field, fieldState }) => (
          <DatePickerWithLabel
            label="開始日"
            width="100%"
            value={field.value}
            onValueChange={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="end"
        control={control}
        render={({ field, fieldState }) => (
          <DatePickerWithLabel
            label="終了日"
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

function PriceRangeDemo() {
  const schema = applyRules(
    z.object({ min: z.string(), max: z.string() }),
    numberRangeValid("min", "max", "最低価格は最高価格以下にしてください"),
  );
  const { control, ...ruleCheck } = useRuleCheck(schema, { min: "", max: "" });
  return (
    <RuleSection
      title="最低価格≤最高価格"
      description="最低価格が最高価格より高いと失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="min"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="最低価格"
            width="100%"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="max"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="最高価格"
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

export default function CrossFieldRules() {
  return (
    <>
      <PasswordMatchDemo />
      <EmailMatchDemo />
      <DateRangeDemo />
      <PriceRangeDemo />
    </>
  );
}
