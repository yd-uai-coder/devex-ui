"use client";

import { useState } from "react";
import { H3, Text, YStack, XStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { CalendarCard } from "@/components/ui/media/CalendarCard";
import DatePickerWithLabel from "@/components/ui/form/DatePickerWithLabel";

export default function CalendarPage() {
  const [confirmedDate, setConfirmedDate] = useState<string | undefined>();
  const [pickedDate, setPickedDate] = useState("");

  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="カレンダー"
        description="CalendarCardで日付を選択・決定するブロックと、DatePickerで日付を選択するブロックのサンプルです。"
      />
      <XStack
        flexDirection="column"
        $md={{
          flexDirection: "row",
          justifyContent:"space-around",
        }}
        gap="$3"
        >
        <YStack gap="$4" >
          <H3>CalendarCard(選択・決定)</H3>
          <CalendarCard onConfirm={setConfirmedDate} />
          <Text>決定した日付: {confirmedDate ?? "未選択"}</Text>
        </YStack>
        <YStack >
          <YStack
            gap="$4"
            width={320}
            padding="$4"
            borderColor="$borderColor"
            >
            <H3>DatePicker(選択)</H3>
            <DatePickerWithLabel label="日付" value={pickedDate} onValueChange={setPickedDate} width="100%" />
          </YStack>
        </YStack>
      </XStack>
    </YStack>
  );
}
