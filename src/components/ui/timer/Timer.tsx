"use client";

import { createTimerStore } from './timer-store';
import { TimerLabel } from "@/components/ui/primitives/TimerLabel";
import { TimerValue } from "@/components/ui/primitives/TimerValue";
import { TimerSetter } from "@/components/ui/timer/TimerSetter";
import { TimerTrigger } from "@/components/ui/timer/TimerTrigger";
import { YStack } from 'tamagui';
import { useState } from 'react';
import { useInterval } from '@/hooks/useInterval';


export  function Timer() {
  const [timerStore] = useState(createTimerStore);
  const isRunning = timerStore((state) => state.isRunning);
  const remainingSeconds = timerStore((state) => state.remainingSeconds);
  const start = timerStore((state) => state.start);
  const pause = timerStore((state) => state.pause);
  const reset = timerStore((state) => state.reset);

  useInterval(() => {
    timerStore.getState().tick();
  }, isRunning ? 1000 : null);

return (
    <YStack gap="$8">
      <YStack alignItems="center" gap="$4">
          <TimerLabel>作業</TimerLabel>
        <YStack alignItems="center">
          <TimerValue
            timer_id = "timer-value"
            active = {isRunning} 
            seconds = {remainingSeconds}
          />
        </YStack>
        <TimerSetter
          store={timerStore}
        />
      </YStack>
      <TimerTrigger
        start={start}
        pause={pause}
        reset={reset}
      />
    </YStack>
  );

}