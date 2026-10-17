"use client";

import { useEffect, useState } from "react";
import type { ProjectRead } from "@/features/dashboard/api/projects";
import { getProject } from "@/features/hearing/api/hearingApi";
import { useInterval } from "@/hooks/useInterval";

export const POLL_INTERVAL_MS = 5000;
export const POLL_TIMEOUT_MS = 3 * 60 * 1000;

// POST /generateは202のみ返しプッシュ通知が無いため、生成完了はGET /projects/{id}のstatusを
// ポーリングして検知する。チャット画面(ヒアリング完了承認後)・ドキュメントプレビュー画面
// (再生成後)・詳細設計画面(テスト仕様書の作成後)で使う共通ロジック。
//
// 生成が終わったこと(`generating` でなくなったこと)を知らせ、読んだプロジェクトを渡す。失敗すると
// サーバーは状態を生成の前(completed のこともある)に戻し、`generation_failure` に記録するので、
// 成功か失敗かは呼び出し元がそれで見分ける(`completed` だけを完了とみなすと、失敗が成功に見える)。
export function useGenerationPolling(
  projectId: string,
  active: boolean,
  onFinished: (project: ProjectRead) => void,
): { timedOut: boolean } {
  const [elapsedMs, setElapsedMs] = useState(0);
  // timedOutはelapsedMsから導出できるため、別state+同期用useEffectは持たない
  // (レンダー中に計算するだけで済み、setStateを伴うeffectを1つ減らせる)。
  const timedOut = elapsedMs >= POLL_TIMEOUT_MS;

  const polling = active && !timedOut;

  useInterval(
    () => {
      void (async () => {
        try {
          const project = await getProject(projectId);
          if (project.status !== "generating") {
            onFinished(project);
            return;
          }
        } catch {
          // 一時的に読めなくても待つのはやめない(次の回に読み直す)
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
