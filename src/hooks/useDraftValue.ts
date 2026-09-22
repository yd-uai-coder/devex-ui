"use client";

import { useState } from "react";

/**
 * 編集中のドラフト値を保持し、確定(commit)操作で初めて外部へ反映するという状態パターン。
 * ポップオーバーの「適用」ボタンや、確定操作を挟む編集UI全般で使う想定の汎用フック。
 */
export function useDraftValue<T>(value: T, onChange: (value: T) => void) {
  const [draft, setDraft] = useState<T>(value);

  // 編集を開始する直前など、外部の確定済み値にドラフトを合わせ直す。
  function resync() {
    setDraft(value);
  }

  // draftを指定値で確定する。引数を省略した場合は現在のドラフト値をそのまま確定する。
  function commit(next: T = draft) {
    setDraft(next);
    onChange(next);
  }

  return { draft, setDraft, resync, commit };
}
