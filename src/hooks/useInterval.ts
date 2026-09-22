"use client";

import { useEffect, useRef } from "react";

/**
 * 一定間隔でコールバックを実行する。delayMs に null を渡すと停止する。
 * (Dan Abramov の useInterval パターン: https://overreacted.io/making-setinterval-declarative-with-react-hooks/)
 */
export function useInterval(callback: () => void, delayMs: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, delayMs);

    return () => clearInterval(id);
  }, [delayMs]);
}
