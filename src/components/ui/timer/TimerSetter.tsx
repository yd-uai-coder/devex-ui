"use client";

import { useState } from "react";
import { Button, XStack, Label, Input } from "tamagui";
import type { TimerStoreInstance } from "./timer-store";

type Props = {
  store: TimerStoreInstance;
};

export function TimerSetter({ store }: Props) {
  // Zustand Store
  const setStartSeconds = store((state) => state.setStartSeconds);

  // 入力値
  const [startHours, setStartHours] = useState("");
  const [startMinutes, setStartMinutes] = useState("");
  const [startSeconds, setInputSeconds] = useState("");

  function sumSeconds() {
    const totalSeconds =
      Number(startHours || 0) * 3600 +
      Number(startMinutes || 0) * 60 +
      Number(startSeconds || 0);

    setStartSeconds(totalSeconds);
  }

  return (
    <XStack alignItems="center" gap="$4">
      <XStack alignItems="center">
        <Input
          placeholder="0"
          min="0"
          type="number"
          width="$6"
          inputMode="numeric"
          value={startHours}
          onChangeText={setStartHours}
        />
        <Label>時間</Label>
      </XStack>

      <XStack alignItems="center">
        <Input
          placeholder="0"
          type="number"
          min="0"
          max="59"
          width="$6"
          inputMode="numeric"
          value={startMinutes}
          onChangeText={setStartMinutes}
        />
        <Label>分</Label>
      </XStack>

      <XStack alignItems="center">
        <Input
          placeholder="0"
          type="number"
          min="0"
          max="59"
          width="$6"
          inputMode="numeric"
          value={startSeconds}
          onChangeText={setInputSeconds}
        />
        <Label>秒</Label>
      </XStack>

      <Button
        size="$4"
        onPress={sumSeconds}
      >
        設定
      </Button>
    </XStack>
  );
}