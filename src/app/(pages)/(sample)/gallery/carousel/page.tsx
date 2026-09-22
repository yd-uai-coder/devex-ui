"use client";

import { useState } from "react";
import { H3, Text, XStack, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { Column } from "@/components/ui/primitives/Column";
import {
  LayoutCarousel,
  LayoutCarouselSlide,
  type LayoutCarouselSlideSize,
} from "@/components/ui/layout-blocks/LayoutCarousel";
import SelectGroupWithLabel from "@/components/ui/form/SelectGroupWithLabel";

const SLIDE_THEMES = ["green", "blue", "orange", "green"] as const;

type AutoPlayOption = "no" | "yes";
type VisibleCountOption = "1" | "2" | "3" | "4";
type PeekWidthOption = "none" | "small" | "large";
type DimOption = "no" | "yes";

const AUTO_PLAY_ITEMS: { value: AutoPlayOption; label: string }[] = [
  { value: "no", label: "なし" },
  { value: "yes", label: "あり(3秒ごと)" },
];
const SLIDE_SIZE_ITEMS: { value: LayoutCarouselSlideSize; label: string }[] = [
  { value: "content-full", label: "基本" },
  { value: "w-full", label: "フルワイド" },
  { value: "grid", label: "1:1固定比率" },
];
const VISIBLE_COUNT_ITEMS: { value: VisibleCountOption; label: string }[] = [
  { value: "1", label: "1件" },
  { value: "2", label: "2件" },
  { value: "3", label: "3件" },
  { value: "4", label: "4件" },
];
const PEEK_WIDTH_ITEMS: { value: PeekWidthOption; label: string }[] = [
  { value: "none", label: "なし" },
  { value: "small", label: "小(0.15)" },
  { value: "large", label: "大(0.3)" },
];
const DIM_ITEMS: { value: DimOption; label: string }[] = [
  { value: "no", label: "なし" },
  { value: "yes", label: "あり" },
];

function DemoSlide({
  label,
  theme,
  height = 280,
}: {
  label: string;
  theme: (typeof SLIDE_THEMES)[number];
  height?: number | string;
}) {
  return (
    <LayoutCarouselSlide>
      <YStack
        theme={theme}
        backgroundColor="$color9"
        height={height}
        alignItems="center"
        justifyContent="center"
      >
        <Text color="white" fontSize="$8" fontWeight="700">
          {label}
        </Text>
      </YStack>
    </LayoutCarouselSlide>
  );
}

export default function LayoutCarouselPage() {
  const [autoPlay, setAutoPlay] = useState<AutoPlayOption>("no");
  const [slideSize, setSlideSize] = useState<LayoutCarouselSlideSize>("content-full");
  const [visibleCount, setVisibleCount] = useState<VisibleCountOption>("1");
  const [peekWidth, setPeekWidth] = useState<PeekWidthOption>("small");
  const [dimOption, setDimOption] = useState<DimOption>("no");

  const isGrid = slideSize === "grid";

  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="カルーセル(スライダー)"
        description="ドラッグ・矢印ボタンで切り替えられるカルーセルのサンプルです。"
      />

      <YStack gap="$3">
        <H3>入力値からモード選択</H3>
        <XStack flexDirection="column" $md={{ flexDirection: "row" }} gap="$4">
          <Column>
            <SelectGroupWithLabel
              label="自動再生"
              labelWidth={90}
              width="100%"
              items={AUTO_PLAY_ITEMS}
              value={autoPlay}
              onValueChange={(value) => setAutoPlay(value as AutoPlayOption)}
              renderValue={(v) => AUTO_PLAY_ITEMS.find((item) => item.value === v)?.label}
            />
          </Column>
          <Column>
            <SelectGroupWithLabel
              label="スライドサイズ"
              labelWidth={90}
              width="100%"
              items={SLIDE_SIZE_ITEMS}
              value={slideSize}
              onValueChange={(value) => setSlideSize(value as LayoutCarouselSlideSize)}
              renderValue={(v) => SLIDE_SIZE_ITEMS.find((item) => item.value === v)?.label}
            />
          </Column>
          <Column>
            <SelectGroupWithLabel
              label="表示数"
              labelWidth={90}
              width="100%"
              items={VISIBLE_COUNT_ITEMS}
              value={visibleCount}
              onValueChange={(value) => setVisibleCount(value as VisibleCountOption)}
              renderValue={(v) => VISIBLE_COUNT_ITEMS.find((item) => item.value === v)?.label}
            />
          </Column>
          <Column>
            <SelectGroupWithLabel
              label="見切れ幅"
              labelWidth={90}
              width="100%"
              items={PEEK_WIDTH_ITEMS}
              value={peekWidth}
              onValueChange={(value) => setPeekWidth(value as PeekWidthOption)}
              renderValue={(v) => PEEK_WIDTH_ITEMS.find((item) => item.value === v)?.label}
            />
          </Column>
          <Column>
            <SelectGroupWithLabel
              label="暗幕"
              labelWidth={90}
              width="100%"
              items={DIM_ITEMS}
              value={dimOption}
              onValueChange={(value) => setDimOption(value as DimOption)}
              renderValue={(v) => DIM_ITEMS.find((item) => item.value === v)?.label}
            />
          </Column>
        </XStack>
        <LayoutCarousel
          ariaLabel="モード選択カルーセル"
          intervalSeconds={autoPlay === "yes" ? 3 : undefined}
          slideSize={slideSize}
          visibleCount={Number(visibleCount)}
          peekFraction={peekWidth === "none" ? 0 : peekWidth === "small" ? 0.15 : 0.3}
          dim={dimOption === "yes"}
        >
          {SLIDE_THEMES.map((theme, index) => (
            <DemoSlide
              key={index}
              label={`モード ${index + 1}`}
              theme={theme}
              height={isGrid ? "100%" : 280}
            />
          ))}
        </LayoutCarousel>
      </YStack>

      <YStack gap="$3">
        <H3>基本</H3>
        <LayoutCarousel ariaLabel="サンプルカルーセル">
          {SLIDE_THEMES.map((theme, index) => (
            <DemoSlide key={index} label={`スライド ${index + 1}`} theme={theme} />
          ))}
        </LayoutCarousel>
      </YStack>

      <YStack gap="$3">
        <H3>自動再生(3秒ごと、ドラッグ・フォーカス中は一時停止)</H3>
        <LayoutCarousel ariaLabel="自動再生カルーセル" intervalSeconds={3}>
          {SLIDE_THEMES.map((theme, index) => (
            <DemoSlide key={index} label={`自動再生 ${index + 1}`} theme={theme} />
          ))}
        </LayoutCarousel>
      </YStack>

      <YStack gap="$3">
        <H3>基本+見切れ幅小+暗幕</H3>
        <LayoutCarousel ariaLabel="チラ見せカルーセル" peekFraction={0.15} dim>
          {SLIDE_THEMES.map((theme, index) => (
            <DemoSlide key={index} label={`Peek ${index + 1}`} theme={theme} />
          ))}
        </LayoutCarousel>
      </YStack>

      <YStack gap="$3">
        <H3>1:1固定比率+2件表示+見切れ幅小</H3>
        <LayoutCarousel ariaLabel="グリッドカルーセル" visibleCount={2} peekFraction={0.15} slideSize="grid">
          {SLIDE_THEMES.map((theme, index) => (
            <DemoSlide key={index} label={`Grid ${index + 1}`} theme={theme} height="100%" />
          ))}
        </LayoutCarousel>
      </YStack>

      <YStack gap="$3">
        <H3>フルワイド+見切れ幅大</H3>
        <LayoutCarousel ariaLabel="画面幅いっぱいカルーセル" slideSize="w-full" peekFraction={0.3} dim>
          {SLIDE_THEMES.map((theme, index) => (
            <DemoSlide key={index} label={`Full ${index + 1}`} theme={theme} />
          ))}
        </LayoutCarousel>
      </YStack>
    </YStack>
  );
}
