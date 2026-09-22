"use client";

import { useMemo, useState } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Fisher-Yatesアルゴリズムで配列をシャッフルする。useHasMountedがfalseの間(サーバー描画・
 * 初回クライアント描画)はitemsをそのまま返し、マウント後にhasMountedがtrueへ切り替わった
 * タイミングで初めてシャッフルする(Math.random()由来のhydrationミスマッチを避けるため)。
 * この初回シャッフルにより、このフックを呼ぶコンポーネントがマウントされるたびに並び順が
 * 変わる。reshuffle()を呼ぶと任意のタイミングで再シャッフルできる。
 */
export function useShuffle<T>(items: T[]) {
  const hasMounted = useHasMounted();
  const [version, setVersion] = useState(0);

  const shuffled = useMemo(
    () => (hasMounted ? shuffle(items) : items),
    // items自体の参照変化では再シャッフルしない(呼び出し元が毎レンダー新しい配列参照を
    // 渡してくる場合でも、マウント時とreshuffle()呼び出し時のみシャッフルする設計のため)。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasMounted, version],
  );

  function reshuffle() {
    setVersion((v) => v + 1);
  }

  return { items: shuffled, reshuffle };
}
