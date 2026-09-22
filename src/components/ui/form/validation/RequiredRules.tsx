"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import { applyRules, noWhitespaceOnly, requiredText } from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

function RequiredInputDemo() {
  const schema = z.object({ value: applyRules(z.string(), requiredText("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="必須入力"
      description="未入力のまま確認すると失敗します。何か入力すると成功します。"
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

function OptionalInputDemo() {
  const schema = z.object({ value: z.string() });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="任意入力"
      description="ルールが無いため、未入力のままでも確認は成功します。"
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

function ForbidEmptyStringDemo() {
  const schema = z.object({ value: applyRules(z.string(), requiredText("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="空文字禁止"
      description="空文字での確認は失敗します(必須入力と同じチェックを使っています)。"
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

function NoWhitespaceOnlyDemo() {
  const schema = z.object({ value: applyRules(z.string(), noWhitespaceOnly("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="空白のみ禁止"
      description="スペースだけを入力して確認すると失敗します(空文字自体は許容します)。"
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

function ForbidNullDemo() {
  const schema = z.object({ value: applyRules(z.string(), requiredText("値")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="NULL禁止"
      description="HTMLのテキスト入力欄は構造上nullを直接持てないため、未入力(空文字)をnull相当とみなし、必須入力と同じチェックで検証します。"
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

export default function RequiredRules() {
  return (
    <>
      <RequiredInputDemo />
      <OptionalInputDemo />
      <ForbidEmptyStringDemo />
      <NoWhitespaceOnlyDemo />
      <ForbidNullDemo />
    </>
  );
}
