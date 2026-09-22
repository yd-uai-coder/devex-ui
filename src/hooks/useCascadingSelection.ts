"use client";

import { useState } from "react";

/**
 * 親の選択肢(例: 年)が変わったら、子の選択肢(例: 月)が新しい親のもとで無効な場合に
 * 自動でフォールバック値へリセットする「連動セレクト」の一般的な挙動。
 * 年月に限らず、カテゴリ/サブカテゴリ等の親子セレクトでも再利用できる。
 */
export function useCascadingSelection<Parent, Child>(
  initialParent: Parent,
  initialChild: Child,
  getChildOptions: (parent: Parent) => Child[],
  fallbackChild: (childOptions: Child[]) => Child
) {
  const [parent, setParentState] = useState(initialParent);
  const [child, setChild] = useState(initialChild);

  const childOptions = getChildOptions(parent);

  function setParent(next: Parent) {
    setParentState(next);
    const nextOptions = getChildOptions(next);
    if (!nextOptions.includes(child)) {
      setChild(fallbackChild(nextOptions));
    }
  }

  return { parent, setParent, child, setChild, childOptions };
}
