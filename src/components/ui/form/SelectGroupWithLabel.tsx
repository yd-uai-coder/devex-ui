"use client";

import { useId } from "react";
import { Check as CheckIcon, ChevronDown, ChevronUp } from "lucide-react";
import type { AdaptWhen, SelectProps, SizeTokens } from "tamagui";
import { Adapt, Label, Select, Sheet, Text, Theme, XStack, YStack } from "tamagui";

// `tamagui.config.ts`はスタイルprop解決を壊さないため`declare module 'tamagui'`による
// カスタム型拡張を行っていない(CLAUDE.md記載)。そのため`AdaptWhen`はメディアキーの型を
// 具体化できず`never`寄りの型になり、実際には有効な"max-md"のようなキーもそのままでは
// 型エラーになる。実行時には`@tamagui/config/v5`のデフォルトで"max-md"が有効なキーであることを
// 確認済みのため、ここではその型不整合をキャストで吸収する。
const MOBILE_BREAKPOINT = "max-md" as unknown as AdaptWhen;
import { STATUS_THEME } from "./formStatus";
import type { FormStatus } from "./formStatus";

type SelectGroupOption = {
  value: string;
  label: string;
};

type SelectGroupWithLabelProps = Omit<SelectProps, "children"> & {
  errorMessage?: string;
  items: SelectGroupOption[];
  label?: string;
  labelWidth?: number | SizeTokens;
  placeholder?: string;
  size?: SizeTokens;
  status?: FormStatus;
  width?: number | SizeTokens;
};

export default function SelectGroupWithLabel({
  errorMessage,
  items,
  label = "ラベル名",
  labelWidth,
  placeholder = "選択してください",
  size,
  status = "default",
  id,
  width = 300,
  ...selectProps
}: SelectGroupWithLabelProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const isDisabled = status === "disabled";
  const effectiveStatus = errorMessage ? "error" : status;

  return (
    <Theme name={STATUS_THEME[effectiveStatus]}>
      <YStack width={width} marginBottom="$3">
      <XStack
        flexDirection="column"
        alignItems="flex-start"
        gap="0"
        $md={{ flexDirection: "row", alignItems: "center", gap: "$4" }}
      >
        <Label size={size} htmlFor={selectId} flexShrink={0} $md={{ width: labelWidth }}>
          {label}
        </Label>
        {/* `SelectProps`は`GetProps<Frame>`ベースではなく専用の狭い型のため`alignSelf`等の
            汎用スタイルpropを受け付けない(型エラーになる)。そのため`Select`本体ではなく
            外側のXStackで幅の伸縮を担わせている。 */}
        <XStack alignSelf="stretch" $md={{ alignSelf: "auto", flex: 1 }}>
          <Select zIndex={400} {...selectProps}>
            <Select.Trigger
              id={selectId}
              size={size}
              width="100%"
              $md={{ width: "auto", flex: 1 }}
              disabled={isDisabled}
              borderColor="$color7"
              iconAfter={ChevronDown}
            >
              <Select.Value placeholder={placeholder} />
            </Select.Trigger>
            <Adapt when={MOBILE_BREAKPOINT} platform="touch">
              <Sheet modal dismissOnSnapToBottom snapPoints={[50]}>
                <Sheet.Frame padding="$4">
                  <Adapt.Contents />
                </Sheet.Frame>
                <Sheet.Overlay backgroundColor="rgba(0,0,0,0.5)" />
              </Sheet>
            </Adapt>

            <Select.Content>
              <Select.ScrollUpButton
                alignItems="center"
                justifyContent="center"
                position="relative"
                width="100%"
                height="$3"
              >
                <YStack zIndex={10}>
                  <ChevronUp size={20} />
                </YStack>
              </Select.ScrollUpButton>

              <Select.Viewport>
                <Select.Group>
                  {items.map((item, index) => (
                    <Select.Item key={item.value} index={index} value={item.value}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                      <Select.ItemIndicator marginLeft="auto">
                        <CheckIcon size={16} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Viewport>

              <Select.ScrollDownButton
                alignItems="center"
                justifyContent="center"
                position="relative"
                width="100%"
                height="$3"
              >
                <YStack zIndex={10}>
                  <ChevronDown size={20} />
                </YStack>
              </Select.ScrollDownButton>
            </Select.Content>
          </Select>
        </XStack>
      </XStack>
      {errorMessage ? (
        <Text color="$color9" fontSize="$2" marginTop="$1" $md={{ marginLeft: labelWidth }}>
          {errorMessage}
        </Text>
      ) : null}
      </YStack>
    </Theme>
  );
}
