"use client";

import { useState } from "react";
import { Image, YStack, styled } from "tamagui";
import { LayoutGrid } from "@/components/ui/layout-blocks/LayoutGrid";
import type { LayoutGridColumns } from "@/components/ui/layout-blocks/LayoutGrid";
import { LayoutCarousel, LayoutCarouselSlide } from "@/components/ui/layout-blocks/LayoutCarousel";
import { ImageMagnifier } from "@/components/ui/primitives/ImageMagnifier";

type GalleryImage = {
  src: string;
  alt?: string;
};

type GalleryProps = {
  images: GalleryImage[];
  width?: number | string;
  /** サムネイルの表示モード(既定"grid") */
  mode?: "grid" | "carousel";
  /** grid モード時の列数(LayoutGridへそのまま渡す、既定{ base: 3, md: 6 }) */
  columns?: LayoutGridColumns;
  /** carousel モード時の同時表示件数(LayoutCarouselへそのまま渡す、既定2) */
  visibleCount?: number;
};


const Thumbnail = styled(YStack, {
  borderWidth: 2,
  borderColor: "transparent",
  borderRadius: "$2",
  overflow: "hidden",

  variants: {
    active: {
      true: {
        borderColor: "$blue8",
      },
    },
  },
});


export function Gallery({
  images,
  width = 600,
  mode = "grid",
  columns = { base: 3, md: 6 },
  visibleCount = 2,
}: GalleryProps) {

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex];

  function renderThumbnail(image: GalleryImage, index: number) {
    return (
      <Thumbnail
        key={image.src}
        active={index === selectedIndex}
        onPress={() => setSelectedIndex(index)}
        // carousel モード時、LayoutCarousel はドラッグ判定の対象外にする要素を
        // `a, button, input, textarea, select, [role="button"]` で判定しており、
        // 素の onPress だけでは role="button" が付かず対象外になってしまう
        // (実測: pointerdown で LayoutCarousel 側に setPointerCapture され、
        // Thumbnail 自身の pointerup が奪われて onPress が発火しなかった)。
        // role/tabIndex を明示してこの判定を通す。
        role="button"
        tabIndex={0}
      >
        <Image
          src={image.src}
          alt={image.alt ?? ""}
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </Thumbnail>
    );
  }

  return (
    <YStack gap="$3" width={width}>

      {/* メイン画像(ホバーで2倍ズームの小窓を表示) */}
      <ImageMagnifier
        src={selectedImage.src}
        alt={selectedImage.alt ?? ""}
        width="100%"
        height={400}
      />


      {/* サムネイル */}
      {mode === "grid" ? (
        <LayoutGrid columns={columns} aspectRatio={1}>
          {images.map((image, index) => renderThumbnail(image, index))}
        </LayoutGrid>
      ) : (
        <LayoutCarousel visibleCount={visibleCount} peekFraction={0.3} dim slideSize="grid">
          {images.map((image, index) => (
            <LayoutCarouselSlide key={image.src}>
              {renderThumbnail(image, index)}
            </LayoutCarouselSlide>
          ))}
        </LayoutCarousel>
      )}

    </YStack>
  );
}
