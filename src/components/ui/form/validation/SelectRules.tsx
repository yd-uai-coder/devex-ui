"use client";

import { Controller } from "react-hook-form";
import { z } from "zod";
import SelectGroupWithLabel from "@/components/ui/form/SelectGroupWithLabel";
import { applyRules, requiredSelection } from "@/lib/schemas/validation-rules";
import { RuleSection, useRuleCheck } from "./shared";

const FRUIT_ITEMS = [
  { value: "apple", label: "りんご" },
  { value: "orange", label: "みかん" },
  { value: "grape", label: "ぶどう" },
  { value: "banana", label: "バナナ" },
];

function PlaceholderForbiddenDemo() {
  const schema = z.object({ value: applyRules(z.string(), requiredSelection("好きな食べ物")) });
  const { control, ...ruleCheck } = useRuleCheck(schema, { value: "" });
  return (
    <RuleSection
      title="プレースホルダー禁止"
      description="プレースホルダー(未選択)のまま確認すると失敗します。"
      {...ruleCheck}
    >
      <Controller
        name="value"
        control={control}
        render={({ field, fieldState }) => (
          <SelectGroupWithLabel
            items={FRUIT_ITEMS}
            label="好きな食べ物"
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

export default function SelectRules() {
  return <PlaceholderForbiddenDemo />;
}
