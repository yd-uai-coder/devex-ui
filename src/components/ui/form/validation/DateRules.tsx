"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import DatePickerWithLabel from "@/components/ui/form/DatePickerWithLabel";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import {
  applyRules,
  dateRangeValid,
  futureOnly,
  pastOnly,
  todayOrEarlier,
  todayOrLater,
  validBirthdate,
  validDateFormat,
  validDateTimeFormat,
  validTimeFormat,
} from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

// 「日付形式/時刻形式/日時形式」は文字列としての形式検証のため、不正な形式を実際に
// 入力できるプレーンテキスト入力を使う。日付の前後比較系(今日以降/過去のみ等)は、
// 任意の日付を自由に選べるDatePickerWithLabelを使う(過去日のみ許可のような制限は
// UI側ではかけず、送信時のZodスキーマ側で検証する)。

function ValidDateFormatDemo() {
  const schema = z.object({ value: applyRules(z.string(), validDateFormat("日付")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="日付形式"
      description='"YYYY-MM-DD"形式でない文字列(例: "2024/01/01")を入力すると失敗します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="日付"
            placeholder="2024-01-01"
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

function ValidTimeFormatDemo() {
  const schema = z.object({ value: applyRules(z.string(), validTimeFormat("時刻")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="時刻形式"
      description='"HH:mm"形式でない文字列を入力すると失敗します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="時刻"
            placeholder="09:30"
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

function ValidDateTimeFormatDemo() {
  const schema = z.object({ value: applyRules(z.string(), validDateTimeFormat("日時")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="日時形式"
      description='"YYYY-MM-DD HH:mm"形式でない文字列を入力すると失敗します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="日時"
            placeholder="2024-01-01 09:30"
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

function TodayOrLaterDemo() {
  const schema = z.object({ value: applyRules(z.string(), todayOrLater("日付")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="今日以降" description="昨日以前の日付を選ぶと失敗します。" {...ruleCheck}>
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <DatePickerWithLabel
            label="日付"
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

function TodayOrEarlierDemo() {
  const schema = z.object({ value: applyRules(z.string(), todayOrEarlier("日付")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="今日以前" description="明日以降の日付を選ぶと失敗します。" {...ruleCheck}>
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <DatePickerWithLabel
            label="日付"
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

function PastOnlyDemo() {
  const schema = z.object({ value: applyRules(z.string(), pastOnly("日付")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="過去のみ" description="今日・未来の日付を選ぶと失敗します。" {...ruleCheck}>
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <DatePickerWithLabel
            label="日付"
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

function FutureOnlyDemo() {
  const schema = z.object({ value: applyRules(z.string(), futureOnly("日付")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="未来のみ" description="今日・過去の日付を選ぶと失敗します。" {...ruleCheck}>
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <DatePickerWithLabel
            label="日付"
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

function DateRangeDemo() {
  const schema = applyRules(
    z.object({ start: z.string(), end: z.string() }),
    dateRangeValid("start", "end", "開始日は終了日以前の日付にしてください"),
  );
  const { control, ...ruleCheck } = useRuleCheck(schema, { start: "", end: "" });
  return (
    <RuleSection
      title="開始日≦終了日"
      description="開始日より前の終了日を選ぶと失敗します。"
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

function ValidBirthdateDemo() {
  const schema = z.object({ value: applyRules(z.string(), validBirthdate("生年月日")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="生年月日が妥当"
      description="未来の日付、または150年より前の日付を選ぶと失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <DatePickerWithLabel
            label="生年月日"
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

export default function DateRules() {
  return (
    <>
      <ValidDateFormatDemo />
      <ValidTimeFormatDemo />
      <ValidDateTimeFormatDemo />
      <TodayOrLaterDemo />
      <TodayOrEarlierDemo />
      <PastOnlyDemo />
      <FutureOnlyDemo />
      <DateRangeDemo />
      <ValidBirthdateDemo />
    </>
  );
}
