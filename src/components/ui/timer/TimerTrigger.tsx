"use client";

import {  XStack } from 'tamagui';
import { StyledButton } from "@/components/ui/primitives/StyledButton";


type Props = {
  start: () => void;
  pause: () => void;
  reset: () => void;
};

export  function TimerTrigger({start,pause,reset}:Props) {

  return (
      <XStack width="100%" justifyContent="center" alignItems="center" gap="$2">
        <StyledButton id="pomodoro-start-button" size="$4" onPress={start}>
          開始
        </StyledButton>
        <StyledButton id="pomodoro-pause-button" size="$4" chromeless onPress={pause}>
          一時停止
        </StyledButton>
        <StyledButton id="pomodoro-reset-button" size="$4" chromeless onPress={reset}>
          リセット
        </StyledButton>
      </XStack>
  );
}