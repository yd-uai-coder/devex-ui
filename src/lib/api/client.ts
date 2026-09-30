import { refreshTokens, useAuthStore } from "@/components/auth/auth-store";
import { API_BASE_URL } from "@/lib/api/base-url";

// サイレントリフレッシュの無限ループを避けるため、リフレッシュ自身のリクエストは
// 401でも再リフレッシュ対象から除外する。
const REFRESH_PATH = "/api/v1/auth/refresh";

export class ApiError extends Error {
  status: number;
  // devex-apiの共通エラー形式{detail, code}のcode(例: "VERSION_CONFLICT")。
  // 同じstatus(409・400)の中で原因を見分けるために使う。codeを持たないエラーではundefined。
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// FastAPI/Pydanticのエラーレスポンス({detail: string, code?: string} または 422時の
// {detail: [{msg: string, ...}, ...]})から、メッセージとcodeを取り出してApiErrorにする。
export async function toApiError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    const code = typeof body?.code === "string" ? body.code : undefined;
    if (typeof body?.detail === "string") return new ApiError(res.status, body.detail, code);
    if (Array.isArray(body?.detail)) {
      const message = body.detail
        .map((issue: { msg?: string }) => issue.msg)
        .filter(Boolean)
        .join(", ");
      return new ApiError(res.status, message, code);
    }
  } catch {
    // レスポンスがJSONでない場合はstatusTextにフォールバックする
  }
  return new ApiError(
    res.status,
    res.statusText || `リクエストに失敗しました(status: ${res.status})`,
  );
}

// バックエンド(FastAPI想定)への薄いfetchラッパー。認証トークンの付与・401時の
// サイレントリフレッシュ+1回だけの透過的リトライ・エラーレスポンスのパースをまとめて担う。
export async function apiFetch<T>(path: string, init?: RequestInit, isRetry = false): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    // リフレッシュトークンはhttpOnly Cookieでやり取りするため、全リクエストでCookie送信を
    // 有効にする(クロスオリジンでも送るために必要)。
    // 実際に    // refresh_token Cookieが送信されるかはCookie自身のpath=/api/v1/auth属性で決まるため、
    // 他のエンドポイントへは送られない。
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    // accessTokenを送った上での401は「セッション切れ・トークン無効」を意味する
    // (トークンを送っていない401は未ログイン状態そのものなので対象外)。
    // まだリトライしていなければ、まずリフレッシュトークンでの再発行を試み、
    // 成功したら新しいアクセストークンで1回だけリクエストをやり直す(サイレントリフレッシュ)。
    if (res.status === 401 && accessToken && !isRetry && path !== REFRESH_PATH) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        return apiFetch<T>(path, init, true);
      }
      // リフレッシュに失敗した場合はrefreshTokens()内で既にログアウト済み
      throw await toApiError(res);
    }

    // リフレッシュを試みなかった/リトライ後も失敗した401は、ログアウト状態に落とす。
    // RequireAuthはaccessTokenの変化に反応して自動的に未認証ガードを表示する。
    if (res.status === 401 && accessToken) {
      useAuthStore.getState().logout();
    }
    throw await toApiError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
