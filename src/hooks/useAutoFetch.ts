"use client";

import { useEffect } from "react";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

// 未取得(idle)の場合のみ自動でfetchを実行する
export function useAutoFetch(status: AsyncStatus, fetch: () => void) {
  useEffect(() => {
    // 未取得の時だけ取得する
    if (status === "idle") fetch();
  }, [status, fetch]);
}
