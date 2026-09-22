"use client";

import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { z } from "zod";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import {
  applyRules,
  integerOnly,
  maxValue,
  minValue,
  nonZero,
  numericOnly,
  positiveOnly,
  valueRange,
} from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

// ネイティブの type="number" 入力は不正な文字種をそもそも入力させられないため、
// 数値系ルールもプレーンテキスト入力(InputSimpleText)を使い、文字列として数値の
// 妥当性を検証する(このページ全体の設計方針。DateRules.tsxも参照)。

function NumberField({
  control,
  label = "値",
}: {
  control: Control<{ value: string }>;
  label?: string;
}) {
  return (
    <Controller
      name="value"
      control={control}
      render={({ field, fieldState }) => (
        <InputSimpleText
          label={label}
          width="100%"
          value={field.value}
          onChangeText={field.onChange}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

function NumericOnlyDemo() {
  const schema = z.object({ value: applyRules(z.string(), numericOnly("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="数値のみ" description='"abc"のような非数値を入力すると失敗します。' {...ruleCheck}>
      <NumberField control={control} />
    </RuleSection>
  );
}

function IntegerOnlyDemo() {
  const schema = z.object({ value: applyRules(z.string(), integerOnly("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="整数のみ" description='"12.5"のような小数を入力すると失敗します。' {...ruleCheck}>
      <NumberField control={control} />
    </RuleSection>
  );
}

function DecimalAllowedDemo() {
  const schema = z.object({ value: applyRules(z.string(), numericOnly("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="小数可"
      description='"整数のみ"の対になる緩いポリシーで、内部的には「数値のみ」と同じチェックです。"12.5"のような小数も成功します。'
      {...ruleCheck}
    >
      <NumberField control={control} />
    </RuleSection>
  );
}

function PositiveOnlyDemo() {
  const schema = z.object({ value: applyRules(z.string(), positiveOnly("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="正数のみ" description="0以下(0や負数)を入力すると失敗します。" {...ruleCheck}>
      <NumberField control={control} />
    </RuleSection>
  );
}

function NegativeAllowedDemo() {
  const schema = z.object({ value: applyRules(z.string(), numericOnly("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="負数可"
      description='"正数のみ"の対になる緩いポリシーで、内部的には「数値のみ」と同じチェックです。負の数値も成功します。'
      {...ruleCheck}
    >
      <NumberField control={control} />
    </RuleSection>
  );
}

function NonZeroDemo() {
  const schema = z.object({ value: applyRules(z.string(), nonZero("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="ゼロ不可" description='"0"を入力すると失敗します。' {...ruleCheck}>
      <NumberField control={control} />
    </RuleSection>
  );
}

function MinValueDemo() {
  const schema = z.object({ value: applyRules(z.string(), minValue("値", 10)) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="最小値" description="10未満の数値を入力すると失敗します。" {...ruleCheck}>
      <NumberField control={control} />
    </RuleSection>
  );
}

function MaxValueDemo() {
  const schema = z.object({ value: applyRules(z.string(), maxValue("値", 100)) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="最大値" description="100を超える数値を入力すると失敗します。" {...ruleCheck}>
      <NumberField control={control} />
    </RuleSection>
  );
}

function ValueRangeDemo() {
  const schema = z.object({ value: applyRules(z.string(), valueRange("値", 1, 10)) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="範囲指定"
      description="1〜10の範囲外の数値を入力すると失敗します。"
      {...ruleCheck}
    >
      <NumberField control={control} />
    </RuleSection>
  );
}

export default function NumberRules() {
  return (
    <>
      <NumericOnlyDemo />
      <IntegerOnlyDemo />
      <DecimalAllowedDemo />
      <PositiveOnlyDemo />
      <NegativeAllowedDemo />
      <NonZeroDemo />
      <MinValueDemo />
      <MaxValueDemo />
      <ValueRangeDemo />
    </>
  );
}
