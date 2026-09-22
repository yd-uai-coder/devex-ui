"use client";

import { useId } from "react";
import type { RadioGroupProps, SizeTokens } from "tamagui";
import { Label, RadioGroup, Text, Theme, XStack, YStack } from "tamagui";
import { STATUS_THEME } from "./formStatus";
import type { FormStatus } from "./formStatus";
import styles from "./RadioGroupWithLabel.module.css";
import { RadioGroupItem } from "@/components/ui/primitives/RadioGroupItem";

type RadioGroupOption = {
  value: string;
  label: string;
};

type RadioGroupOrientation = "horizontal" | "vertical";

type RadioGroupWithLabelProps = Omit<RadioGroupProps, "children"> & {
  errorMessage?: string;
  items: RadioGroupOption[];
  label?: string;
  labelWidth?: number | SizeTokens;
  orientation?: RadioGroupOrientation;
  size?: SizeTokens;
  status?: FormStatus;
  width?: number | SizeTokens;
};

export default function RadioGroupWithLabel({
  errorMessage,
  items,
  label = "ラベル名",
  labelWidth,
  orientation = "horizontal",
  size,
  status = "default",
  width = 300,
  ...radioGroupProps
}: RadioGroupWithLabelProps) {
  const groupId = useId();
  const isDisabled = status === "disabled";
  const isVertical = orientation === "vertical";
  const ListStack = isVertical ? YStack : XStack;
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
          <Label size={size} id={groupId} flexShrink={0} $md={{ width: labelWidth }}>
            {label}
          </Label>
          {/* `flex={1}`をRadioGroupへ直接渡すとRovingFocusGroup(内部の素のView、column方向)側ではなく
              孫のRadioGroupFrameにflex-basis:0が付与され、column方向の主軸(=高さ)に対してbasis:0が
              解釈されて高さ0に潰れる(ラベルとの上下ずれの原因、実機で高さ0px・offsetHeight 0・
              scrollHeight 44を計測して確認済み)。自前のXStackで囲み、flexはこちらに持たせることで回避する。 */}
          <XStack
            minWidth={0}
            className={styles.radioGroupWrap}
            alignSelf="stretch"
            $md={{ alignSelf: "auto", flex: 1 }}
          >
            <RadioGroup aria-labelledby={groupId} disabled={isDisabled} minWidth={0} {...radioGroupProps}>
              <ListStack
                alignItems="center"
                flexWrap={isVertical ? undefined : "wrap"}
                gap={isVertical ? "$2" : "$4"}
              >
                {items.map((item) => {
                  const itemId = `${groupId}-${item.value}`;
                  return (
                    <XStack key={item.value} alignItems="center" gap="$2">
                      <RadioGroupItem value={item.value} id={itemId} textSize={size} />
                      <Label size={size} htmlFor={itemId}>
                        {item.label}
                      </Label>
                    </XStack>
                  );
                })}
              </ListStack>
            </RadioGroup>
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
