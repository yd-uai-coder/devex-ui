import { create } from "zustand";
import { apiFetch } from "@/lib/api/client";
import type { AsyncStatus } from "@/lib/api/types";

export type AccessTokenResponse = { access_token: string; token_type: string };

type AuthStore = {
  accessToken: string | null;
  status: AsyncStatus;
  error: string | null;
  // 実際のログインAPI呼び出し(エンドポイントの形はアプリごとに異なるため)は呼び出し側で行い、
  // 得られたアクセストークンをこの関数へ渡してストアへ保存する。リフレッシュトークンは
  // httpOnly Cookieでサーバーが管理するため、クライアント側では一切保持しない。
  login: (accessToken: string) => void;
  logout: () => void;
  // ページ読み込み直後、httpOnly Cookieに残っているリフレッシュトークンからアクセストークンの
  // 復元を試みる。AuthBootstrapがマウント時に一度だけ呼ぶ。
  bootstrap: () => Promise<void>;
};

// アクセストークンの有効期限切れの何秒前にサイレントリフレッシュを走らせるか
const SILENT_REFRESH_MARGIN_SECONDS = 60;

// リロード後もログイン状態を維持するため、トークンのみlocalStorageへ永続化する
// (status/errorは一時的なUI状態のため保存しない)。
export const useAuthStore = create<AuthStore>()((set) => ({
  accessToken: null,
  // 初期値はloading: bootstrap()によるセッション復元(Cookieからのリフレッシュ試行)が
  // 完了するまでは「未ログイン」と確定できないため、idleではなくloadingから始める
  // (RequireAuthはこれを見て、復元が終わるまでログイン必須ダイアログの表示を保留する)。
  status: "loading",
  error: null,
  login: (accessToken) => {
    set({ accessToken, status: "success", error: null });
    scheduleSilentRefresh(accessToken);
  },
  // アクセストークンを破棄しログアウト状態に戻す。リフレッシュトークンはhttpOnly Cookieのため
  // クライアント側からは消せない(JSから見えない)ので、サーバー側でCookieごと失効させる
  // /api/v1/auth/logoutをベストエフォートで呼ぶ(失敗してもクライアント側は既にログアウト
  // 済み扱いにする。Cookieは14日で自然失効するため致命的ではない)。
  logout: () => {
    scheduleSilentRefresh(null);
    set({ accessToken: null, status: "idle", error: null });
    void apiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
  },
  bootstrap: async () => {
    await refreshTokens();
  },
}));

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let refreshPromise: Promise<boolean> | null = null;

// JWTのexp(秒)をデコードする。署名検証はしない(有効期限の目安を読むだけの用途のため)。
function decodeJwtExpMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

// 次回のサイレントリフレッシュのタイマーを(再)設定する。accessTokenがnullなら解除するのみ。
function scheduleSilentRefresh(accessToken: string | null): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  if (!accessToken) return;

  const expMs = decodeJwtExpMs(accessToken);
  if (expMs === null) return;

  const delay = Math.max(expMs - Date.now() - SILENT_REFRESH_MARGIN_SECONDS * 1000, 0);
  refreshTimer = setTimeout(() => {
    void refreshTokens();
  }, delay);
}

// httpOnly Cookieのリフレッシュトークンから新しいアクセストークンを取得する。バックエンドの
// POST /api/v1/auth/refresh はCookie中のrefresh_tokenを読み取り{access_token, token_type}を
// 返す(リクエストボディは不要。apiFetchが常にcredentials:"include"を付与するためCookieは
// 自動送信される)。複数箇所から同時に呼ばれても実際のリフレッシュ処理は1回にまとめる
// (多重リフレッシュ防止)。Cookieが無い/期限切れ等で失敗した場合は静かにログアウト状態にする
// (bootstrap()からの呼び出しでは「まだ一度もログインしていない」を意味するだけで、
// エラーとしてユーザーには表示しない)。
export function refreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const tokens = await apiFetch<AccessTokenResponse>("/api/v1/auth/refresh", {
        method: "POST",
      });
      useAuthStore.setState({ accessToken: tokens.access_token, status: "success", error: null });
      scheduleSilentRefresh(tokens.access_token);
      return true;
    } catch {
      useAuthStore.setState({ accessToken: null, status: "idle", error: null });
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
