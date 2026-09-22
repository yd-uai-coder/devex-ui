"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Text, XStack, YStack } from "tamagui";
import { useCalendarGrid } from "@/hooks/useCalendarGrid";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export type CalendarSelection = { year: number; month: number; day: number };

export function Calendar({
  initialYear,
  initialMonth,
  initialSelectedDay,
  variant = "default",
  onSelectionChange,
}: {
  initialYear: number;
  initialMonth: number;
  initialSelectedDay?: number;
  variant?: "default" | "onGradient";
  onSelectionChange?: (selection: CalendarSelection | undefined) => void;
}) {
  const onGradient = variant === "onGradient";
  const { year, month, cells, monthDate, goPrev: gridGoPrev, goNext: gridGoNext } =
    useCalendarGrid(initialYear, initialMonth);
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);

  const monthLabel = monthDate
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();

  function goPrev() {
    gridGoPrev();
    setSelectedDay(undefined);
    onSelectionChange?.(undefined);
  }

  function goNext() {
    gridGoNext();
    setSelectedDay(undefined);
    onSelectionChange?.(undefined);
  }

  return (
    <YStack gap="$3">
      <XStack alignItems="center" justifyContent="space-between">
        <Button
          size="$2"
          circular
          theme="orange"
          chromeless
          color={onGradient ? "white" : undefined}
          hoverStyle={{ backgroundColor: "$color9" }}
          icon={<ChevronLeft size={16} />}
          onPress={goPrev}
        />
        <Text fontWeight="700" fontSize="$3" color={onGradient ? "white" : undefined}>
          {monthLabel}
        </Text>
        <Button
          size="$2"
          circular
          theme="orange"
          chromeless
          color={onGradient ? "white" : undefined}
          hoverStyle={{ backgroundColor: "$color9" }}
          icon={<ChevronRight size={16} />}
          onPress={goNext}
        />
      </XStack>
      <XStack>
        {WEEKDAYS.map((day) => (
          <YStack key={day} width={`${100 / 7}%`} alignItems="center">
            <Text fontSize="$1" color={onGradient ? "white" : "$color9"} opacity={onGradient ? 0.8 : 1}>
              {day}
            </Text>
          </YStack>
        ))}
      </XStack>
      <YStack>
        {Array.from({ length: cells.length / 7 }).map((_, row) => (
          <XStack key={row}>
            {cells.slice(row * 7, row * 7 + 7).map((cell, index) => {
              const isSelected = cell.currentMonth && cell.day === selectedDay;
              return (
                <YStack
                  key={index}
                  width={`${100 / 7}%`}
                  alignItems="center"
                  paddingVertical="$1"
                >
                  <Button
                    size="$2"
                    circular
                    theme="orange"
                    chromeless={!isSelected}
                    backgroundColor={isSelected ? "$color9" : undefined}
                    color={isSelected ? "white" : onGradient ? "white" : undefined}
                    hoverStyle={!isSelected ? { backgroundColor: "$color9" } : undefined}
                    opacity={cell.currentMonth ? 1 : 0.35}
                    disabled={!cell.currentMonth}
                    onPress={() => {
                      setSelectedDay(cell.day);
                      onSelectionChange?.({ year, month, day: cell.day });
                    }}
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
  );
}
