import "server-only";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ISR対象ページ(Server Component)専用のfetchヘルパー。apiFetch(client.ts)と違い
// 認証ストア/localStorageのアクセストークンには一切依存せず、認証不要な公開エンドポイントのみを
// 対象とする。バックエンド未起動時などの取得失敗はnullを返しページ全体をクラッシュさせない
// (呼び出し側はnull時にクライアント側fetch・静的フォールバック等へ切り替える)。
export async function serverFetch<T>(path: string, revalidateSeconds: number): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
