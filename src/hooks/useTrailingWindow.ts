"use client";

import { useMemo } from "react";

export type YearMonth = { year: number; month: number };

/**
 * 基準の年月から遡って直近size件分の年月配列(先頭が最も古い月)を作る。
 * 特定のダッシュボードのデータ形状に依存しない、年月ベースの直近Nウィンドウ抽出処理。
 */
export function useTrailingWindow(end: YearMonth, size: number): YearMonth[] {
  return useMemo(() => {
    const window: YearMonth[] = [];
    let y = end.year;
    let m = end.month;
    for (let i = 0; i < size; i++) {
      window.unshift({ year: y, month: m });
      m -= 1;
      if (m < 1) {
        m = 12;
        y -= 1;
      }
    }
    return window;
  }, [end.year, end.month, size]);
}
