"use client";

import { useState } from "react";
import { YStack } from "tamagui";
import {
  createTimerStore,
  type TimerStoreInstance,
} from "./timer-store";
import { TimerLabel } from "@/components/ui/primitives/TimerLabel";
import { TimerValue } from "@/components/ui/primitives/TimerValue";
import { TimerSetter } from "@/components/ui/timer/TimerSetter";
import { TimerTrigger } from "@/components/ui/timer/TimerTrigger";
import { useInterval } from "@/hooks/useInterval";

type Phase = "work" | "break";

function useTimerTick(store: TimerStoreInstance, onComplete?: () => void) {
  const isRunning = store((state) => state.isRunning);

  useInterval(() => {
    store.getState().tick();
    const next = store.getState();
    if (!next.isRunning && next.remainingSeconds === 0) {
      onComplete?.();
    }
  }, isRunning ? 1000 : null);
}

export function TimerPomodoro() {
  const [workStore] = useState(createTimerStore);
  const [breakStore] = useState(createTimerStore);
  const [phase, setPhase] = useState<Phase>("work");

  useTimerTick(workStore, () => {
    breakStore.getState().reset();
    breakStore.getState().start();
    setPhase("break");
  });
  useTimerTick(breakStore, () => {
    workStore.getState().reset();
    workStore.getState().start();
    setPhase("work");
  });

  const workRemainingSeconds = workStore((state) => state.remainingSeconds);
  const breakRemainingSeconds = breakStore((state) => state.remainingSeconds);

  const activeStore = phase === "work" ? workStore : breakStore;

  const start = () => activeStore.getState().start();
  const pause = () => activeStore.getState().pause();
  const reset = () => {
    workStore.getState().reset();
    breakStore.getState().reset();
    setPhase("work");
  };

  return (
    <YStack gap="$8">
      <YStack alignItems="center" gap="$4">
        <TimerLabel>作業</TimerLabel>
        <TimerValue
          timer_id="work-timer-value"
          active={phase === "work"}
          seconds={workRemainingSeconds}
        />
        <TimerSetter store={workStore} />
      </YStack>
      <YStack alignItems="center" gap="$4">
        <TimerLabel>休憩</TimerLabel>
        <TimerValue
          timer_id="break-timer-value"
          active={phase === "break"}
          seconds={breakRemainingSeconds}
        />
        <TimerSetter store={breakStore} />
      </YStack>
      <TimerTrigger start={start} pause={pause} reset={reset} />
    </YStack>
  );
}
