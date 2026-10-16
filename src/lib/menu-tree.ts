// 遷移する項目。auth を付けた項目はログインの状態で出し分ける
// (guest = 未ログインのときだけ、user = ログイン中だけ)。
export type MenuLink = { kind: "link"; label: string; href: string; auth?: MenuAuth };
// 遷移でなく処理をする項目(ログアウト)。処理の中身は描画側(MenuEntry)が持つ。
export type MenuAction = { kind: "action"; label: string; action: "logout"; auth?: MenuAuth };
export type MenuItem = MenuLink | MenuAction;
// href を持つグループは、それ自体がリンク(子を持たない TOP)。
export type MenuGroup = { label: string; href?: string; children: MenuItem[] };

export type MenuAuth = "guest" | "user";

// Devexの実ページ構成を反映する。HierarchicalMenu(サイドメニュー)・トップページ
// (リンクカード)・404ページ(リンクカラム)の3箇所から参照される共有データ。
// `/projects/[id]/chat`・`/projects/[id]/documents`は動的ルート(プロジェクトIDが
// 必須)のためここには含めない ── ダッシュボードのプロジェクト一覧から遷移する。
export const MENU_TREE: MenuGroup[] = [
  { label: "TOP", href: "/", children: [] },
  {
    label: "CONTENTS",
    children: [
      { kind: "link", label: "ダッシュボード", href: "/dashboard" },
      // mode なしで開くと、作成画面がモード選択ダイアログを出す
      { kind: "link", label: "新規プロジェクト作成", href: "/projects/new" },
    ],
  },
  {
    label: "Authentication",
    children: [
      { kind: "link", label: "ログイン", href: "/login", auth: "guest" },
      { kind: "link", label: "ユーザー登録", href: "/register", auth: "guest" },
      { kind: "action", label: "ログアウト", action: "logout", auth: "user" },
    ],
  },
  {
    label: "Guide",
    // 仮のリンク(ページはまだ無く、開くと 404)
    children: [{ kind: "link", label: "作成予定", href: "/guide" }],
  },
];

// ログインの状態に合う項目だけを残す。auth が null(状態の確認中)のときは、
// auth を付けた項目をどちらも出さない(確認が終わったときに入れ替わって見えるのを避ける)。
// 項目がすべて消えたグループは除く(リンクのグループは残す)。
export function visibleMenuTree(tree: MenuGroup[], auth: MenuAuth | null): MenuGroup[] {
  return tree
    .map((group) => ({
      ...group,
      children: group.children.filter((item) => item.auth === undefined || item.auth === auth),
    }))
    .filter((group) => group.href !== undefined || group.children.length > 0);
}

// 項目の React の key(link は href、action は処理の名前)
export function menuItemKey(item: MenuItem): string {
  return item.kind === "link" ? item.href : `action:${item.action}`;
}
