"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import { applyRules, fullWidthOnly, halfWidthAlnumSymbolOnly, halfWidthOnly } from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

function HalfWidthOnlyDemo() {
  const schema = z.object({ value: applyRules(z.string(), halfWidthOnly("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="半角のみ"
      description='全角文字(例: "あいう")を入力して確認すると失敗します。半角英数字・記号は成功します。'
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

function FullWidthOnlyDemo() {
  const schema = z.object({ value: applyRules(z.string(), fullWidthOnly("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="全角のみ"
      description='半角文字(例: "abc")を入力して確認すると失敗します。全角文字は成功します。'
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

function HalfWidthAlnumSymbolOnlyDemo() {
  const schema = z.object({ value: applyRules(z.string(), halfWidthAlnumSymbolOnly("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="半角英数と記号のみ"
      description="全角文字や半角スペースを含めると失敗します。半角英数字・記号(スペース無し)は成功します。"
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

export default function CharacterTypeRules() {
  return (
    <>
      <HalfWidthOnlyDemo />
      <FullWidthOnlyDemo />
      <HalfWidthAlnumSymbolOnlyDemo />
    </>
  );
}
