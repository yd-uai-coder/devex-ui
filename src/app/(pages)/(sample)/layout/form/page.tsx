"use client";

import { YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { LayoutForm } from "@/components/ui/form/sample-form/LayoutForm";

export default function LayoutPage() {
  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb pageTitle="Formレイアウト" description="フォーム部品を組み合わせた入力フォームのサンプルです。" />
      <LayoutForm />
    </YStack>
  );
}
