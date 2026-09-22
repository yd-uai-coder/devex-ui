export const CACHE_TTL_MS = 20_000;

// 直近のfetchがTTL以内なら再フェッチ不要と判定する。storeのfetchedAtと組み合わせて使う
// (React Query等を導入せず、TTLキャッシュ+mutation後のinvalidateだけで鮮度を管理する方針)。
export function isCacheFresh(fetchedAt: number | null): boolean {
  return fetchedAt !== null && Date.now() - fetchedAt < CACHE_TTL_MS;
}
