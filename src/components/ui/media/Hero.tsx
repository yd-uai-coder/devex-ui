"use client";

import type { ReactNode } from "react";
import { Image, XStack, YStack } from "tamagui";

export type HeroMode = "background" | "imageRight" | "imageLeft";
export type HeroOverlayColor = "white" | "black";

type HeroProps = {
  children: ReactNode;
  imageSrc: string;
  imageAlt?: string;
  /** 画像の使用パターン(既定"background") */
  mode?: HeroMode;
  /** コンポーネントの高さ(既定480) */
  height?: number | string;
  /** 網掛けの色(既定"black"、mode="background"では常に、imageRight/imageLeftではimageOverlay指定時のみ使用) */
  overlayColor?: HeroOverlayColor;
  /** 網掛けの強さ(0〜1、既定0.4) */
  overlayOpacity?: number;
  /** imageRight/imageLeftモード時、画像側に重ねる追加コンテンツ(任意) */
  imageOverlay?: ReactNode;
};

// 「画像 + (contentがある場合のみ)網掛け + 重ねるコンテンツ」という構造を
// mode="background"(Hero全体)とmode②③(画像側ハーフ)の両方で共有するための内部部品。
function ImagePane({
  imageSrc,
  imageAlt,
  overlayColor,
  overlayOpacity,
  content,
}: {
  imageSrc: string;
  imageAlt: string;
  overlayColor: HeroOverlayColor;
  overlayOpacity: number;
  content?: ReactNode;
}) {
  const rgb = overlayColor === "white" ? "255,255,255" : "0,0,0";
  return (
    <YStack position="relative" width="100%" height="100%" overflow="hidden">
      <Image
        src={imageSrc}
        alt={imageAlt}
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        right={0}
        width="100%"
        height="100%"
        objectFit="cover"
      />
      {content ? (
        <>
          <YStack
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            backgroundColor={`rgba(${rgb},${overlayOpacity})`}
            pointerEvents="none"
          />
          <YStack position="relative" zIndex={1} width="100%" height="100%" justifyContent="center" padding="$6">
            {content}
          </YStack>
        </>
      ) : null}
    </YStack>
  );
}

export function Hero({
  children,
  imageSrc,
  imageAlt = "",
  mode = "background",
  height = 480,
  overlayColor = "black",
  overlayOpacity = 0.4,
  imageOverlay,
}: HeroProps) {
  if (mode === "background") {
    return (
      <YStack width="100%" height={height} borderTopWidth={1} borderBottomWidth={1} borderColor="$borderColor">
        <ImagePane
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
          content={children}
        />
      </YStack>
    );
  }

  return (
    <XStack
      width="100%"
      flexDirection="column"
      $md={{ flexDirection: mode === "imageLeft" ? "row-reverse" : "row", height }}
      overflow="hidden"
      borderTopWidth={1}
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      <YStack width="100%" padding="$6" justifyContent="center" $md={{ flex: 1, width: 0 }}>
        {children}
      </YStack>
      <YStack width="100%" height={280} $md={{ flex: 1, width: 0, height: "100%" }}>
        <ImagePane
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
          content={imageOverlay}
        />
      </YStack>
    </XStack>
  );
}
