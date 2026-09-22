"use client";

import { YStack,Separator,H2 } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { Counter } from "@/components/ui/misc/Counter";
import { Timer } from "@/components/ui/timer/Timer";
import { TimerPomodoro } from "@/components/ui/timer/TimerPomodoro";

export default function CounterPage() {
  return (
    <YStack  gap="$4">
      <Breadcrumb pageTitle="カウント" description="カウンター・タイマー・ポモドーロタイマーのサンプルです。" />
      <H2>カウンター</H2>
      <Counter />
      <Separator alignSelf="stretch"  marginHorizontal={16} />
      <H2>タイマー</H2>
      <Timer/>
      <Separator alignSelf="stretch"  marginHorizontal={16} />
      <H2>ポモドーロ(切り替え)タイマー</H2>
      <TimerPomodoro/>
      <Separator alignSelf="stretch"  marginHorizontal={16} />

    </YStack>
  );
}
