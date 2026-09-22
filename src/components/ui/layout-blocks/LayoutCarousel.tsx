"use client";

import type { DragEvent, ReactNode } from "react";
import { Children, isValidElement, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, XStack, YStack } from "tamagui";
import { useInfiniteCarousel } from "@/hooks/useInfiniteCarousel";

const DEFAULT_TRANSITION_DURATION_MS = 500;
// 複数件が同時に(チラ見せ含め)見えている場合にのみ、隣接コンテンツ間に持たせる隙間。
// Tamagui `$6`トークンの値(px)と揃えている。
const GAP_PX = 32;

// チラ見せ幅(アイテム幅に対する比率)は自由な数値ではなく3段階の離散値に限定している
// (ユーザー指定)。0=チラ見せ無し、0.15=控えめ、0.3=強め。
export type LayoutCarouselPeekFraction = 0 | 0.15 | 0.3;

// スライドサイズ設定。以前は`variant`という1つの離散プリセットが`visibleCount`/
// `peekFraction`/`dim`/`aspectRatio`をまとめて決定していたが、呼び出し側で個別に
// 組み合わせられるよう、この4項目を独立したpropsに分解した(ユーザー指示)。
// - w-full: ページ本文の横paddingをはみ出し、ビューポート端まで広がるフルブリード。
// - content-full: 親コンテナの幅いっぱい(既定、従来の唯一の挙動)。
// - grid: 各スライド項目を縦横1:1固定にする(旧`grid`バリアントの`aspectRatio`相当)。
export type LayoutCarouselSlideSize = "w-full" | "content-full" | "grid";

export type LayoutCarouselProps = {
  children: ReactNode;
  /** 指定時、この秒数ごとに自動で次のスライドへ進む(ドラッグ中・フォーカス中は一時停止) */
  intervalSeconds?: number;
  /** スライド切り替えの遷移時間(ミリ秒、既定500ms) */
  transitionDurationMs?: number;
  ariaLabel?: string;
  /** 同時に完全表示するスライド件数(既定1) */
  visibleCount?: number;
  /** 非activeなスライドに暗幕を重ねるか(既定false) */
  dim?: boolean;
  /** 左右のチラ見せ幅(アイテム幅に対する比率、既定0=チラ見せ無し) */
  peekFraction?: LayoutCarouselPeekFraction;
  /** スライドサイズ(既定"content-full"): w-full=画面端いっぱい / content-full=親コンテナ幅いっぱい / grid=1:1固定比率 */
  slideSize?: LayoutCarouselSlideSize;
};

// 元は`src/components/parts/carousel/`にあったTailwindベースの実装(Carousel.tsx/
// CarouselSlide.tsx/CarouselIcons.tsx)を、可能な限りTamaguiコンポーネントで再現したもの。
//
// ドラッグ量に応じて連続的に変化するtranslateX(%)と、呼び出し元が任意のミリ秒数を指定できる
// transitionDurationは、Tamaguiのtransition prop(quick/medium/lazy等、tamagui.config.tsで
// 定義済みのプリセット名しか受け付けない)やx/y prop(px単位の離散値が前提で、コンテナ幅に対する
// 相対%を毎フレーム計算するこの用途には合わない)では表現できないため、スライドトラック部分のみ
// styleプロップに生CSSを渡している(このプロジェクトで`theme-gradients.ts`のbackgroundImage等
// 既に使われている「Tamaguiのトークン体系で表現しきれない場合はstyleを使う」という既知のパターンを
// 踏襲)。それ以外(コンテナ・前後ボタン・アイコン等)はすべてTamaguiコンポーネント・propで構成している。
export function LayoutCarousel({
  children,
  intervalSeconds,
  transitionDurationMs = DEFAULT_TRANSITION_DURATION_MS,
  ariaLabel,
  visibleCount = 1,
  dim = false,
  peekFraction = 0,
  slideSize = "content-full",
}: LayoutCarouselProps) {
  // childrenが実際に変わらない限り再構築しない(ドラッグ中はdragOffsetPercentが
  // pointermoveのたびに更新されるため、useMemo無しだとその都度スライド配列・クローン
  // 配列を再構築してしまう無駄が生じる)。「データの追加・削除は初期化時以外は行わない」
  // という無限ループ実装の前提を、実際のコード上でも徹底するための措置。
  const slides = useMemo(() => Children.toArray(children).filter(isValidElement), [children]);
  const count = slides.length;
  const aspectRatio = slideSize === "grid" ? 1 : undefined;
  // 同時に複数件(チラ見せ含め)見えている場合にのみ隣接コンテンツ間の隙間を入れる。
  // visibleCount=1・peekFraction=0(何も隣接して見えない)のときだけ0になる。
  const gapPx = visibleCount > 1 || peekFraction > 0 ? GAP_PX : 0;

  // 無限ループ化のため、実スライドの前後に複製(クローン)を追加した配列を描画する。
  // indexはこの表示用配列(displaySlides)上の位置を直接表す値であり、論理スライド番号
  // (0〜count-1)ではない。
  const {
    containerRef,
    cloneCount,
    index,
    isDragging,
    dragOffsetPercent,
    isTransitioning,
    suppressTransition,
    goPrev,
    goNext,
    handlePointerDown,
    handlePointerMove,
    endDrag,
    handleTransitionEnd,
    onFocusCapture,
    onBlurCapture,
  } = useInfiniteCarousel({ count, visibleCount, intervalSeconds, transitionDurationMs });

  const displaySlides = useMemo(
    () =>
      cloneCount > 0
        ? [...slides.slice(count - cloneCount), ...slides, ...slides.slice(0, cloneCount)]
        : slides,
    [slides, count, cloneCount],
  );

  // visibleCount件を完全表示しつつ左右にpeekFraction(アイテム幅比)ずつチラ見せするための
  // 一般化した幅・位置計算。visibleCount=1・peekFraction=0(full)のとき、
  // itemWidthPercent=100・leadingOffsetPercent=0となり、旧来の
  // `translatePercent = -(index * 100) + dragOffsetPercent` と完全に一致する。
  const itemWidthPercent = 100 / (visibleCount + 2 * peekFraction);
  const leadingOffsetPercent = peekFraction * itemWidthPercent;
  const translatePercent = leadingOffsetPercent - index * itemWidthPercent + dragOffsetPercent;

  return (
    <YStack
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      position="relative"
      width={slideSize === "w-full" ? "100vw" : "100%"}
      overflow="hidden"
      userSelect="none"
      // slideSize="w-full"のときだけ、AppShellのpaddingHorizontal="$4"をはみ出して
      // ビューポート端まで広げる「フルブリード」の負のマージンを追加する。marginLeft/
      // marginRightはTamaguiの型上calc()文字列を受け付けないため、他の生CSS値と同じく
      // styleプロップ経由で渡している。
      style={{
        touchAction: "pan-y",
        ...(slideSize === "w-full"
          ? { marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)" }
          : {}),
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      // onDragStart/onFocusCapture/onBlurCaptureはTamaguiのView propの型定義に
      // 含まれていない(React NativeベースでWeb固有のcapture系イベントを想定していないため)が、
      // 実行時にはそのままDOM要素に渡り正しく機能する(DataFilter.tsxのPopover.Triggerに
      // suppressHydrationWarningを渡す際と同じ、オブジェクトスプレッドによる型チェック回避)。
      {...{
        onDragStart: (event: DragEvent) => event.preventDefault(),
        onFocusCapture,
        onBlurCapture,
      }}
    >
      <XStack
        flexWrap="nowrap"
        style={{
          transform: `translateX(${translatePercent}%)`,
          transitionProperty: isDragging ? "none" : "transform",
          transitionDuration: isDragging || suppressTransition ? "0ms" : `${transitionDurationMs}ms`,
          transitionTimingFunction: "ease-out",
        }}
        // onTransitionEndもTamaguiの型定義に含まれていないため、上と同じくオブジェクト
        // スプレッドで型チェックを回避している。
        {...{ onTransitionEnd: handleTransitionEnd }}
      >
        {displaySlides.map((slide, slideIndex) => {
          const isActive = slideIndex >= index && slideIndex < index + visibleCount;
          return (
            <XStack
              key={slideIndex}
              position="relative"
              width={gapPx ? `calc(${itemWidthPercent}% - ${gapPx}px)` : `${itemWidthPercent}%`}
              // gapは左右均等(gapPx/2ずつ)に配分する。片側(marginRightのみ)に寄せると、
              // チラ見せ(peekFraction)表示で「前アイテムの末尾を覗く」窓と「次アイテムの
              // 先頭を覗く」窓とで、同じ窓幅の中にgapが占める割合が異なってしまい
              // (前者はgapを窓の中に多く含み、後者はgapをほとんど含まない)、左右のチラ見せが
              // 非対称に見える不具合があった(実機のスクリーンショットで確認)。左右均等配分に
              // することで、どちらの窓も同じ比率でgapを含むようになり対称に見える。
              marginLeft={gapPx / 2}
              marginRight={gapPx / 2}
              flexShrink={0}
              aspectRatio={aspectRatio}
            >
              {slide}
              {/* dim=true時の暗幕。自分自身(このスライド項目)がactiveか否かで
                  自分の実際の枠(gap調整済み)をそのまま覆う。コンテナ側で別途幅を計算する
                  方式(以前の実装)だと、gapの導入で見切れ幅とズレる恐れがあったため、
                  各スライド項目が自分自身の状態で判断する方式にした(ユーザー提案)。
                  条件付きマウント/アンマウントではなく常時マウントしたままopacityを
                  0(active)⇄1(非active)で切り替えることで、フェードイン/アウトを
                  トラックのtransformと同じtransitionDurationMs・ease-outでアニメーション
                  させ、移動の開始・完了とフェードの開始・完了が厳密に一致するようにしている。 */}
              {dim && (
                <YStack
                  position="absolute"
                  top={0}
                  bottom={0}
                  left={0}
                  right={0}
                  backgroundColor="rgba(0,0,0,0.5)"
                  pointerEvents="none"
                  style={{
                    opacity: isActive ? 0 : 1,
                    transitionProperty: "opacity",
                    transitionDuration: isDragging || suppressTransition ? "0ms" : `${transitionDurationMs}ms`,
                    transitionTimingFunction: "ease-out",
                  }}
                />
              )}
            </XStack>
          );
        })}
      </XStack>

      {count > 1 && (
        <>
          <YStack position="absolute" top={0} bottom={0} left="$2" justifyContent="center" zIndex={2}>
            <Button
              circular
              size="$3"
              disabled={isTransitioning}
              onPress={goPrev}
              aria-label="前のスライド"
              backgroundColor={isTransitioning ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.4)"}
              hoverStyle={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              pressStyle={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              icon={<ChevronLeft size={20} color={isTransitioning ? "rgba(255,255,255,0.4)" : "white"} />}
            />
          </YStack>
          <YStack position="absolute" top={0} bottom={0} right="$2" justifyContent="center" zIndex={2}>
            <Button
              circular
              size="$3"
              disabled={isTransitioning}
              onPress={goNext}
              aria-label="次のスライド"
              backgroundColor={isTransitioning ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.4)"}
              hoverStyle={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              pressStyle={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              icon={<ChevronRight size={20} color={isTransitioning ? "rgba(255,255,255,0.4)" : "white"} />}
            />
          </YStack>
        </>
      )}
    </YStack>
  );
}

// 元のCarouselSlideに相当する、スライド1件分の全面表示ラッパー。
export function LayoutCarouselSlide({ children }: { children: ReactNode }) {
  return (
    <YStack width="100%" height="100%">
      {children}
    </YStack>
  );
}
