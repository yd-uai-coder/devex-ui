"use client";

import { useEffect, useState } from "react";
import { getProject } from "@/features/hearing/api/hearingApi";
import { useInterval } from "@/hooks/useInterval";

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

// POST /generateは202のみ返しプッシュ通知が無いため、生成完了はGET /projects/{id}のstatusを
// ポーリングして検知する。チャット画面(ヒアリング完了承認後)とドキュメントプレビュー画面
// (再生成後)の両方で使う共通ロジック(元はChatPageContent.tsxに直接書かれていたが、
// ドキュメントプレビュー画面という2つ目の実消費者ができたためこのフックに切り出した)。
export function useGenerationPolling(
  projectId: string,
  active: boolean,
  onCompleted: () => void,
): { timedOut: boolean } {
  const [elapsedMs, setElapsedMs] = useState(0);
  // timedOutはelapsedMsから導出できるため、別state+同期用useEffectは持たない
  // (レンダー中に計算するだけで済み、setStateを伴うeffectを1つ減らせる)。
  const timedOut = elapsedMs >= POLL_TIMEOUT_MS;

  const polling = active && !timedOut;

  useInterval(
    () => {
      void (async () => {
        const project = await getProject(projectId);
        if (project.status === "completed") {
          onCompleted();
          return;
        }
        setElapsedMs((current) => current + POLL_INTERVAL_MS);
      })();
    },
    polling ? POLL_INTERVAL_MS : null,
  );

  // activeがfalseに戻ったら(例: 新しいプロジェクトに切り替わった)状態をリセットする。
  // elapsedMsは外部シグナル(active)に同期する内部stateであり、レンダー中に導出できる
  // 値ではないためeffectでのsetStateが妥当(eslint-disableはこの1箇所のみに限定する)。
  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedMs(0);
    }
  }, [active]);

  return { timedOut };
}
