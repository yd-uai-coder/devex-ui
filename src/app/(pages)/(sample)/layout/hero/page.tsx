"use client";

import { H1, H2, H3, H4, Paragraph, Theme, YStack,Group } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { Hero } from "@/components/ui/media/Hero";
import type { HeroOverlayColor } from "@/components/ui/media/Hero";
import InputSimpleText from "@/components/ui/form/InputSimpleText";
import InputPassword from "@/components/ui/form/InputPassword";
import { StyledButton } from "@/components/ui/primitives/StyledButton";

const SAMPLE_IMAGE = "https://dummyimage.com/1800x600/b3e687/ffffff&text=sample_img";

// imageOverlayに渡す用のデモコンテンツ(簡単なログインフォームパネル、送信処理は無い見た目のみ)。
// overlayColorに応じてパネル背景・文字色を切り替え、Heroの網掛けに対して視認性を確保する。
// InputSimpleText/InputPasswordのLabel文字色はコンポーネント内部でテーマトークンに固定されて
// おり外部から上書きできないため、パネル全体をTheme name="light"/"dark"で明示的に包み、
// サイト全体の現在のライト/ダーク設定とは無関係に「網掛けの色に対して読みやすい向き」へ
// 強制的に揃えている(パネル自体の背景色・見出し・ボタンは生のrgba/hex値を明示指定する)。
function renderLoginFormOverlay(overlayColor: HeroOverlayColor) {
  const isWhite = overlayColor === "white";
  const headingColor = isWhite ? "#1a1a1a" : "#ffffff";

  return (
    <Theme name={isWhite ? "light" : "dark"}>
      <YStack
        width="100%"
        height="100%"
        justifyContent="center"
        padding="$4"
        gap="$3"
      >
        <H4 color={headingColor}>ログイン</H4>
        <Group>
          <InputSimpleText label="メール" labelWidth={60}  width="100%" placeholder="example@email.com" />
          <InputPassword label="パスワード" labelWidth={60} width="100%" />
        </Group>
        <StyledButton  marginTop="$2">
          ログイン
        </StyledButton>
      </YStack>
    </Theme>
  );
}

export default function HeroPage() {
  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="Hero"
        description="画像とコンテンツを組み合わせたファーストビュー(Heroセクション)の3パターン(背景・画像右・画像左)のサンプルです。"
      />

      <YStack gap="$3">
        <H3>①背景として使用(黒の網掛け)</H3>
        <Hero mode="background" imageSrc={SAMPLE_IMAGE} overlayColor="black" overlayOpacity={0.4}>
          <H1 color="white">見出しテキスト</H1>
          <Paragraph color="white">説明文がここに入ります。</Paragraph>
        </Hero>
      </YStack>

      <YStack gap="$3">
        <H3>②コンテンツ左・画像右(画像側にログインフォームカードを重ねる例)</H3>
        <Hero
          mode="imageRight"
          imageSrc={SAMPLE_IMAGE}
          imageOverlay={renderLoginFormOverlay("white")}
          overlayColor="white"
          overlayOpacity={0.5}
        >
          <H2>見出しテキスト</H2>
          <Paragraph>説明文がここに入ります。</Paragraph>
        </Hero>
      </YStack>

      <YStack gap="$3">
        <H3>③コンテンツ右・画像左(画像側にログインフォームカードを重ねる例)</H3>
        <Hero
          mode="imageLeft"
          imageSrc={SAMPLE_IMAGE}
          imageOverlay={renderLoginFormOverlay("black")}
        >
          <H2>見出しテキスト</H2>
          <Paragraph>説明文がここに入ります。</Paragraph>
        </Hero>
      </YStack>
    </YStack>
  );
}
