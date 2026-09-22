"use client";

import type { PointerEvent as ReactPointerEvent, TransitionEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { TamaguiElement } from "tamagui";

const DRAG_THRESHOLD_RATIO = 0.15;
const DEFAULT_TRANSITION_DURATION_MS = 500;
const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]';

export type UseInfiniteCarouselOptions = {
  /** 実スライドの件数 */
  count: number;
  /** 同時に完全表示するスライド件数(既定1) */
  visibleCount?: number;
  /** 指定時、この秒数ごとに自動で次のスライドへ進む(ドラッグ中・フォーカス中は一時停止) */
  intervalSeconds?: number;
  /** スライド切り替えの遷移時間(ミリ秒、既定500ms) */
  transitionDurationMs?: number;
};

/**
 * ドラッグ操作・自動再生・トランジションロック・クローンバッファでのインデックス補正を
 * 伴う「無限ループカルーセル」の状態管理。スライドの中身(表示用配列の構築・レンダリング)は
 * 呼び出し側の責務とし、このフックは index / ドラッグ量 / 各種イベントハンドラのみを返す。
 */
export function useInfiniteCarousel({
  count,
  visibleCount = 1,
  intervalSeconds,
  transitionDurationMs = DEFAULT_TRANSITION_DURATION_MS,
}: UseInfiniteCarouselOptions) {
  // 「クローン領域に入った時点のtransitionend発火でスナップする」という無限ループの仕組み上、
  // 同時に進行中の遷移は(isTransitioningによって)常に高々1件に保証されるため、クローンは
  // 1ステップ分のオーバーシュートにだけ備えれば十分。
  const cloneCount = count > 1 ? Math.min(visibleCount + 1, count) : 0;

  const [index, setIndex] = useState(cloneCount);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetPercent, setDragOffsetPercent] = useState(0);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  // クローン領域からのスナップ復帰時、その1フレームだけtransitionを無効化して
  // ユーザーに見えない瞬間移動にするためのフラグ。
  const [suppressTransition, setSuppressTransition] = useState(false);
  // 移動アニメーションが完了するまで前後ボタン・新規ドラッグ開始を無効化するためのフラグ。
  const [isTransitioning, setIsTransitioning] = useState(false);
  // オートプレイのsetIntervalに渡すgoNextは古いクロージャを長期間使い回すため、
  // isTransitioningを直接参照するとロック中でも素通りしてしまう。refなら常に最新値を読める。
  const isTransitioningRef = useRef(false);

  const containerRef = useRef<TamaguiElement>(null);
  const startXRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  function lockTransition() {
    isTransitioningRef.current = true;
    setIsTransitioning(true);
  }
  function unlockTransition() {
    isTransitioningRef.current = false;
    setIsTransitioning(false);
  }

  function goNext() {
    if (isTransitioningRef.current) return;
    // transitionDurationMsが0だとtransitionendが発火せずロックが解除されなくなるため、
    // 0以下のときはロックしない。
    if (transitionDurationMs > 0) lockTransition();
    setIndex((current) => current + 1);
  }
  function goPrev() {
    if (isTransitioningRef.current) return;
    if (transitionDurationMs > 0) lockTransition();
    setIndex((current) => current - 1);
  }

  useEffect(() => {
    if (!intervalSeconds || intervalSeconds <= 0 || count <= 1 || isDragging || hasFocusWithin) {
      return;
    }
    // goNextは毎レンダー再生成されるが依存配列には含めない(含めるとタイマーがリセットされる)。
    // goNext内のガードはisTransitioningRef(ref)を直接読むため古いクロージャでも問題ない。
    const id = setInterval(goNext, intervalSeconds * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalSeconds, count, isDragging, hasFocusWithin]);

  // 遷移アニメーション完了時、indexがクローン領域に入っていたら対応する実スライド領域の
  // 位置(±count)へアニメーション無しで即座にスナップし直す(クローンバッファ+無音スナップ方式)。
  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== "transform") return;
    if (cloneCount > 0 && index < cloneCount) {
      setSuppressTransition(true);
      setIndex(index + count);
    } else if (cloneCount > 0 && index >= cloneCount + count) {
      setSuppressTransition(true);
      setIndex(index - count);
    }
    unlockTransition();
  }

  useEffect(() => {
    if (!suppressTransition) return;
    const raf = requestAnimationFrame(() => setSuppressTransition(false));
    return () => cancelAnimationFrame(raf);
  }, [suppressTransition]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (count <= 1 || isTransitioning) return;
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerIdRef.current !== event.pointerId) return;
    const width = containerRef.current?.offsetWidth || 1;
    const deltaX = event.clientX - startXRef.current;
    setDragOffsetPercent((deltaX / width) * 100);
  };

  const endDrag = () => {
    if (!isDragging) return;
    if (dragOffsetPercent < -DRAG_THRESHOLD_RATIO * 100) {
      goNext();
    } else if (dragOffsetPercent > DRAG_THRESHOLD_RATIO * 100) {
      goPrev();
    }
    setIsDragging(false);
    setDragOffsetPercent(0);
    pointerIdRef.current = null;
  };

  return {
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
    onFocusCapture: () => setHasFocusWithin(true),
    onBlurCapture: () => setHasFocusWithin(false),
  };
}
