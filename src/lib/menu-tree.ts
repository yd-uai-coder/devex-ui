export type MenuLeaf = { label: string; href: string };
export type MenuGroup = { label: string; children: MenuLeaf[] };

// Devexの実ページ構成を反映する。HierarchicalMenu(サイドメニュー)・トップページ
// (リンクカード)・404ページ(リンクカラム)の3箇所から参照される共有データ。
// `/projects/[id]/chat`・`/projects/[id]/documents`は動的ルート(プロジェクトIDが
// 必須)のためここには含めない ── ダッシュボードのプロジェクト一覧から遷移する。
export const MENU_TREE: MenuGroup[] = [
  {
    label: "Devex",
    children: [
      { label: "ダッシュボード", href: "/dashboard" },
      { label: "新規プロジェクト作成", href: "/projects/new" },
      { label: "ユーザー登録", href: "/register" },
      { label: "ログイン", href: "/login" },
    ],
  },
];
