"use client";

import { H3, YStack } from "tamagui";
import { Breadcrumb } from "@/components/ui/primitives/Breadcrumb";
import { Gallery } from "@/components/ui/media/Gallery";

const images = [
  { src: "https://dummyimage.com/400x400/b3e687/ffffff", alt: "商品画像1" },
  { src: "https://dummyimage.com/401x400/b3e687/ffffff", alt: "商品画像2" },
  { src: "https://dummyimage.com/400x402/b3e687/ffffff", alt: "商品画像3" },
  { src: "https://dummyimage.com/403x400/b3e687/ffffff", alt: "商品画像4" },
  { src: "https://dummyimage.com/400x404/b3e687/ffffff", alt: "商品画像5" },
  { src: "https://dummyimage.com/405x400/b3e687/ffffff", alt: "商品画像6" },
  { src: "https://dummyimage.com/400x406/b3e687/ffffff", alt: "商品画像7" },
  { src: "https://dummyimage.com/407x400/b3e687/ffffff", alt: "商品画像8" },
];

export default function ProductPage() {
  return (
    <YStack paddingVertical="$4" gap="$6">
      <Breadcrumb
        pageTitle="ギャラリー"
        description={"メイン画像とサムネイル一覧を組み合わせたギャラリーのサンプルです。\nサムネイルの表示モードはグリッドとカルーセルの2つ。メインの画像にマウスを置くとズーム表示されます。"}
      />

      <YStack gap="$3">
        <H3>グリッド表示</H3>
        <Gallery images={images} width={400} mode="grid" />
      </YStack>

      <YStack gap="$3">
        <H3>カルーセル表示</H3>
        <Gallery images={images} width={400} mode="carousel" visibleCount={2} />
      </YStack>
    </YStack>
  );
}
