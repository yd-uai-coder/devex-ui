"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import InputPassword from "@/components/ui/form/InputPassword";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import {
  applyRules,
  digitRequired,
  fieldNotContained,
  letterRequired,
  lowercaseRequired,
  maxLength,
  minLength,
  noRepeatedChars,
  symbolRequired,
  uppercaseRequired,
} from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

function MinLengthDemo() {
  const schema = z.object({ value: applyRules(z.string(), minLength("パスワード", 8)) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="最低文字数" description="8文字未満で確認すると失敗します。" {...ruleCheck}>
      <Controller
        name="value"
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
    </RuleSection>
  );
}

function MaxLengthDemo() {
  const schema = z.object({ value: applyRules(z.string(), maxLength("パスワード", 20)) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="最大文字数" description="20文字を超えて確認すると失敗します。" {...ruleCheck}>
      <Controller
        name="value"
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
    </RuleSection>
  );
}

function LetterRequiredDemo() {
  const schema = z.object({ value: applyRules(z.string(), letterRequired("パスワード")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="英字必須" description="英字を含めずに確認すると失敗します。" {...ruleCheck}>
      <Controller
        name="value"
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
    </RuleSection>
  );
}

function UppercaseRequiredDemo() {
  const schema = z.object({ value: applyRules(z.string(), uppercaseRequired("パスワード")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="大文字必須" description="大文字を含めずに確認すると失敗します。" {...ruleCheck}>
      <Controller
        name="value"
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
    </RuleSection>
  );
}

function LowercaseRequiredDemo() {
  const schema = z.object({ value: applyRules(z.string(), lowercaseRequired("パスワード")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="小文字必須" description="小文字を含めずに確認すると失敗します。" {...ruleCheck}>
      <Controller
        name="value"
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
    </RuleSection>
  );
}

function DigitRequiredDemo() {
  const schema = z.object({ value: applyRules(z.string(), digitRequired("パスワード")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="数字必須" description="数字を含めずに確認すると失敗します。" {...ruleCheck}>
      <Controller
        name="value"
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
    </RuleSection>
  );
}

function SymbolRequiredDemo() {
  const schema = z.object({ value: applyRules(z.string(), symbolRequired("パスワード")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection title="記号必須" description="記号を含めずに確認すると失敗します。" {...ruleCheck}>
      <Controller
        name="value"
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
    </RuleSection>
  );
}

function NoRepeatedCharsDemo() {
  const schema = z.object({ value: applyRules(z.string(), noRepeatedChars("パスワード")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="同一文字連続禁止"
      description='"aaa"のように同じ文字を3回以上連続で使うと失敗します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
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
    </RuleSection>
  );
}

function UsernameNotContainedDemo() {
  const schema = applyRules(
    z.object({ username: z.string(), password: z.string() }),
    fieldNotContained("password", "username", "パスワードにユーザー名を含めることはできません"),
  );
  const { control, ...ruleCheck } = useRuleCheck(schema, { username: "", password: "" });
  return (
    <RuleSection
      title="ユーザー名を含まない"
      description="パスワードにユーザー名の文字列が含まれていると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="username"
        control={control}
        render={({ field, fieldState }) => (
          <InputSimpleText
            label="ユーザー名"
            width="100%"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
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
    </RuleSection>
  );
}

export default function PasswordRules() {
  return (
    <>
      <MinLengthDemo />
      <MaxLengthDemo />
      <LetterRequiredDemo />
      <UppercaseRequiredDemo />
      <LowercaseRequiredDemo />
      <DigitRequiredDemo />
      <SymbolRequiredDemo />
      <NoRepeatedCharsDemo />
      <UsernameNotContainedDemo />
    </>
  );
}
