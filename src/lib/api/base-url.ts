// NEXT_PUBLIC_API_URLの末尾スラッシュを除去する。付いたままだと`${API_BASE_URL}${path}`が
// `https://host//api/...`になり、Cookieのpath=/api/v1/authにマッチせず、
// リフレッシュトークンが送られない(F5でログイン状態が切れる)。
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
  /\/+$/,
  "",
);
