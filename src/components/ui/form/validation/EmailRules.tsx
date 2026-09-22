"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import InputEmail from "@/components/ui/form/InputEmail";
import { applyRules, emailDomainRestriction, validEmail } from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

function ValidEmailDemo() {
  const schema = z.object({ value: applyRules(z.string(), validEmail("メール")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="メール形式"
      description='"@"を含まない等、メールアドレスの形式でない文字列を入力すると失敗します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
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
    </RuleSection>
  );
}

function EmailDomainRestrictionDemo() {
  const schema = z.object({
    value: applyRules(z.string(), emailDomainRestriction("メール", ["example.com"])),
  });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="ドメイン制限"
      description='"@example.com"以外のドメインで確認すると失敗します。'
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <InputEmail
            label="メール"
            placeholder="taro@example.com"
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

export default function EmailRules() {
  return (
    <>
      <ValidEmailDemo />
      <EmailDomainRestrictionDemo />
    </>
  );
}
