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
  {
    label: "開発用",
    children: [
      // バックエンド無しで UML 画面の挙動を確かめるデモ(Phase 11 時点)
      { label: "UML設計図デモ", href: "/uml-demo" },
      // 詳細設計モードの 05・06 章の見せ方の提案(仮データ)
      { label: "詳細設計 05・06章デモ", href: "/detailed-design-demo" },
    ],
  },
];
