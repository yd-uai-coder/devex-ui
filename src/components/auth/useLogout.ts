"use client";

import { useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import { clearLoginFlag } from "@/lib/auth-flag";

// メニューの「ログアウト」の処理。サーバーで refresh トークンを失効させてから、トップページを
// 読み込み直す。ストアのトークンを先に消すと、遷移が終わる前に保護ページの RequireAuth が
// ログイン必須ダイアログを一瞬出すため、ストアは消さずに読み込み直しでメモリごと捨てる
// (前の利用者のデータを持つ他のストアも消える)。失効の API はベストエフォートで、失敗しても
// 読み込み直す(その場合は cookie が残り、起動時の復元でログインの状態に戻る)。
// ログインの印は読み込み直す前に消す(失効に失敗したときは、復元の成功で付き直す)。
export function useLogout(): () => Promise<void> {
  return useCallback(async () => {
    await apiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
    clearLoginFlag();
    window.location.assign("/");
  }, []);
}
