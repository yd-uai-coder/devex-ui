"use client";

import { useRef, useState } from "react";
import { Image, YStack } from "tamagui";
import type { TamaguiElement } from "tamagui";

const LENS_OFFSET = 20; // カーソルと小窓の間の余白(px)

type ImageMagnifierProps = {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  /** ズーム倍率(既定2) */
  zoom?: number;
  /** 小窓の一辺のサイズ(px、既定180) */
  lensSize?: number;
};

export function ImageMagnifier({
  src,
  alt = "",
  width = "100%",
  height = 400,
  zoom = 8,
  lensSize = 180,
}: ImageMagnifierProps) {
  const containerRef = useRef<TamaguiElement>(null);
  const [hovering, setHovering] = useState(false);
  const [bgPosition, setBgPosition] = useState({ x: 50, y: 50 });
  const [lensOffset, setLensOffset] = useState({ x: 0, y: 0 });

  function handleMouseMove(event: { clientX: number; clientY: number }) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const relY = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    setBgPosition({ x: relX * 100, y: relY * 100 });
    setLensOffset({
      x: event.clientX - rect.left + LENS_OFFSET,
      y: event.clientY - rect.top + LENS_OFFSET,
    });
  }

  return (
    <YStack
      ref={containerRef}
      position="relative"
      width={width}
      height={height}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <Image src={src} alt={alt} width="100%" height="100%" objectFit="cover" borderRadius="$3" />
      {hovering && (
        <YStack
          position="absolute"
          left={lensOffset.x}
          top={lensOffset.y}
          width={lensSize}
          height={lensSize}
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$3"
          overflow="hidden"
          pointerEvents="none"
          zIndex={10}
          backgroundColor="$background"
          style={{
            backgroundImage: `url("${src}")`,
            backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
            backgroundPosition: `${bgPosition.x}% ${bgPosition.y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </YStack>
  );
}
