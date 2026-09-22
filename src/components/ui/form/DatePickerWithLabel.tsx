"use client";

import { useId, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SizeTokens } from "tamagui";
import { Button, Label, Popover, Text, Theme, XStack, YStack } from "tamagui";
import { STATUS_THEME } from "./formStatus";
import type { FormStatus } from "./formStatus";
import { parseDateString, useCalendarGrid } from "@/hooks/useCalendarGrid";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type DatePickerWithLabelProps = {
  errorMessage?: string;
  id?: string;
  label?: string;
  labelWidth?: number | SizeTokens;
  name?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: SizeTokens;
  status?: FormStatus;
  value?: string;
  width?: number | SizeTokens;
};

export default function DatePickerWithLabel({
  errorMessage,
  id,
  label = "日付",
  labelWidth,
  name,
  onValueChange,
  placeholder = "日付を選択",
  size,
  status = "default",
  value = "",
  width = 300,
}: DatePickerWithLabelProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const effectiveStatus = errorMessage ? "error" : status;
  const isDisabled = status === "disabled";

  const [open, setOpen] = useState(false);
  const today = new Date();
  const parsed = parseDateString(value);
  const { cells, monthDate, goPrev: goPrevMonth, goNext: goNextMonth, setView } = useCalendarGrid(
    parsed?.year ?? today.getFullYear(),
    parsed?.month ?? today.getMonth()
  );

  const monthLabel = monthDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  function openPopover(nextOpen: boolean) {
    if (nextOpen) {
      const current = parseDateString(value);
      setView(current?.year ?? today.getFullYear(), current?.month ?? today.getMonth());
    }
    setOpen(nextOpen);
  }

  function selectDay(dateString: string) {
    onValueChange?.(dateString);
    setOpen(false);
  }

  return (
    <Theme name={STATUS_THEME[effectiveStatus]}>
      <YStack width={width} marginBottom="$3">
        <XStack
          flexDirection="column"
          alignItems="flex-start"
          gap="0"
          $md={{ flexDirection: "row", alignItems: "center", gap: "$4" }}
        >
          <Label size={size} htmlFor={inputId} flexShrink={0} $md={{ width: labelWidth }}>
            {label}
          </Label>
          <Popover open={open} onOpenChange={openPopover} placement="top-start">
            <Popover.Trigger asChild>
              {/* Tamaguiはビルド時CSS抽出(@tamagui/next-plugin等)を使わないランタイムの
                  アトミックCSS生成のため、同種のButtonが多数同時マウントされる場面で
                  SSR/CSR間のクラス名の並び順が一致しないことがある(見た目には影響しない)。
                  ClientOnlyで描画自体を遅延させると表示に1〜2秒のラグが生じるため、
                  このBoxのみ警告を抑制して即座に描画させる。 */}
              <Button
                id={inputId}
                name={name}
                size={size}
                disabled={isDisabled}
                borderColor="$color7"
                justifyContent="flex-start"
                alignSelf="stretch"
                $md={{ alignSelf: "auto", flex: 1 }}
                {...{ suppressHydrationWarning: true }}
              >
                <Text color={value ? undefined : "$color9"}>{value || placeholder}</Text>
              </Button>
            </Popover.Trigger>
            {/* カレンダー部分はサイトのライト/ダークモードに関わらず常に白背景・黒文字で
                表示する(ユーザー指示)。$color9等のトークンは現在のサイトテーマ(ライト/ダーク)
                に応じて解決先が変わってしまい、ダークモードのアンビエントテーマ下では文字色が
                白背景に対してほぼ不可視になる(ダークテーマの中間トークンは明るい色になるため)。
                当初`<Theme name="light">`でラップしトークン解決先を強制する方式を試したが、
                Popover.Contentが開閉状態に関わらず常にDOMへマウントされている都合上、
                SSR時点のアンビエントテーマとhydration後のアンビエントテーマが(サイト全体の
                ダーク/ライト判定タイミングの都合で)食い違うケースがあり、ネストしたTheme境界の
                クラス名がSSR/CSR間で不一致になりhydrationミスマッチ警告が発生した。
                そのためTheme境界は使わず、この中の色はすべてトークンに頼らないリテラル値
                (white/black/グレー等)で直接指定し、アンビエントテーマの影響を受けないようにしている。 */}
            <Popover.Content
              zIndex={400}
              padding="$3"
              borderWidth={1}
              borderColor="#e0e0e0"
              elevation="$4"
              backgroundColor="white"
            >
              <YStack gap="$2" width={240}>
                <XStack alignItems="center" justifyContent="space-between">
                  <Button
                    size="$2"
                    circular
                    chromeless
                    color="black"
                    icon={<ChevronLeft size={16} />}
                    onPress={goPrevMonth}
                    aria-label="前の月"
                  />
                  <Text fontWeight="700" color="black">
                    {monthLabel}
                  </Text>
                  <Button
                    size="$2"
                    circular
                    chromeless
                    color="black"
                    icon={<ChevronRight size={16} />}
                    onPress={goNextMonth}
                    aria-label="次の月"
                  />
                </XStack>
                <XStack>
                  {WEEKDAYS.map((day) => (
                    <YStack key={day} width={`${100 / 7}%`} alignItems="center">
                      <Text fontSize="$1" color="#666666">
                        {day}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
                <YStack>
                  {Array.from({ length: cells.length / 7 }).map((_, row) => (
                    <XStack key={row}>
                      {cells.slice(row * 7, row * 7 + 7).map((cell) => {
                        const isSelected = cell.dateString === value;
                        return (
                          <YStack
                            key={cell.dateString}
                            width={`${100 / 7}%`}
                            alignItems="center"
                            paddingVertical="$1"
                          >
                            <Button
                              size="$2"
                              circular
                              chromeless={!isSelected}
                              theme={isSelected ? "orange" : undefined}
                              backgroundColor={isSelected ? "$color9" : undefined}
                              color={isSelected ? "white" : "black"}
                              opacity={cell.currentMonth ? 1 : 0.35}
                              onPress={() => selectDay(cell.dateString)}
                            >
                              {cell.day}
                            </Button>
                          </YStack>
                        );
                      })}
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            </Popover.Content>
          </Popover>
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
