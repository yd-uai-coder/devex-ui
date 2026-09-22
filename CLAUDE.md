# CLAUDE.md

このファイルは、このリポジトリで作業するClaude Codeへのガイドです。

## これは何か

Next.js(App Router)+ TamaguiのUIテンプレート/デモ集(`next-tamagui-templates`)。目的は2つ:

1. UIデザインにおける使いやすいサンプル集であること
2. このリポジトリをcloneすれば、今後のアプリ開発(特にFastAPIバックエンドとデータ連携するアプリ)で開発とテストがスムーズに進められること

コード・コメント・コミットメッセージ・ドキュメントは基本的に日本語です。詳細な機能一覧・使い方は`README.md`を参照してください(本ファイルはアーキテクチャの意図と、セッションをまたいで再発しやすいハマりどころの記録に専念します)。

## コマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:3000, Turbopack)
npm run build         # 本番ビルド
npm run start          # 本番ビルドの起動
npm run lint            # ESLint (eslint-config-next core-web-vitals + typescript)
npm run test             # Vitestを一度だけ実行
npm run test:watch        # Vitest watchモード
```

単一テストファイルの実行: `npx vitest run src/components/ui/data/DataFilter.test.tsx`
名前でテストを絞り込む: `npx vitest run -t "テスト名の一部"`

## アーキテクチャ

**レンダリングモデル**: 全ページSSG(静的生成)が基本です。以前DBを都度クエリしていた`/data/chart`・`/data/data-filter-sort`・`/form-parts/suggest`の3ページも、現在は`src/data/*.json`の静的スナップショットを参照するだけの構成に変わっており、Vercelデプロイに動的なDB/Tursoの設定は不要です(詳細はREADMEの「データベース」節)。

**ディレクトリ構成の意図**:
- `src/app/(pages)/(sample)/` — デモページ本体。`src/lib/menu-tree.ts`の`MENU_TREE`(サイドメニュー・トップページ・404ページが共有)とグループ・ラベルが対応している。新しいデモページを追加したら`MENU_TREE`にも追記すること。
- `src/components/ui/` — 特定ページに依存しない、機能単位(`primitives`/`form`/`data`/`charts`/`layout-blocks`/`media`/`timer`/`misc`)のUI部品置き場。Zustandストアが必要なコンポーネント(Counter/Timer等)はストアを同じディレクトリにcolocateする方針(`src/lib/stores/`のような集約ディレクトリは持たない — YAGNI)。
- `src/components/layout/` — ヘッダー/サイドメニュー/フッター等、全ページ共通のアプリシェル(chrome)。
- `src/components/auth/` — 認証(JWT)関連のストア・ガードコンポーネント。下記「バックエンド連携」参照。
- `src/hooks/` — 複数コンポーネントで再利用する汎用カスタムフック。「どのコンポーネントのために作ったか」ではなく「何を処理するか」を基準に命名しており、対象コンポーネント以外からの再利用を前提にしている。
- `src/lib/api/` — バックエンド(FastAPI)との通信を担う層。下記参照。
- `src/db/` — Drizzle ORM + libSQL(Turso)のDBセットアップ。上記の通り現在アプリの実行時パスからは切り離されており(`db:export-json`でJSONへ書き出す一方向のみ)、将来DBを使った動的機能を追加する場合の基盤として残している。

**バックエンド連携(FastAPI前提)**: このテンプレートは、実運用では別リポジトリのFastAPIバックエンドとデータ連携するアプリの土台として使うことを想定している。バックエンド自体はこのリポジトリに含まれず、`npm run dev`から起動されるものでもない。

- `src/lib/api/client.ts`の`apiFetch<T>()` — `NEXT_PUBLIC_API_URL`(`.env.example`参照、未設定時`http://localhost:8000`)を単一の設定源とする薄いfetchラッパー。`ApiError`(status+message)、FastAPI/Pydanticの`{detail: string | [{msg}]}`形式のエラーパース、`204 No Content`対応を持つ。**ドキュメント化された例外**: `src/lib/api/`は本来featureに依存しない層だが、`client.ts`だけは認証トークンの取得・401時のログアウトのために`src/components/auth/auth-store.ts`をimportしている。
- `src/lib/api/server-fetch.ts`の`serverFetch<T>()` — Server Component/ISR用。`'server-only'`ガード、認証トークンには依存しない(公開エンドポイント専用)、失敗時は例外を投げずnullを返してページ全体のクラッシュを防ぐ。
- `src/lib/api/cache.ts` — React Query/SWRを使わない代わりのTTLキャッシュ判定(`isCacheFresh`、既定20秒)。各機能のZustandストアが`fetchedAt`を持ち、mutation成功時に`null`へ戻す(invalidate)ことで鮮度を管理する設計(詳細はREADME「APIへのデータ取得の方針」)。
- `src/components/auth/auth-store.ts` — JWTの`exp`をデコードしてサイレントリフレッシュタイマーを仕掛けるZustand `persist`ストア。同時リフレッシュは1回にまとめる(`refreshPromise`による重複排除)。`RequireAuth`/`GuardedLink`/`LoginRequiredDialog`と組み合わせて使う(`/others/protected-demo`がデモページ)。ログインAPI自体の契約(エンドポイント形状)はアプリごとに異なるため、`login(accessToken, refreshToken)`はトークンを受け取って保存するだけにしてあり、実際のログインフォーム/APIコールは呼び出し側(実アプリ)で実装する。

**テーマ設定(`tamagui.config.ts`)**: quaiz-front(このテンプレートを起点に作られたアプリ)と設定を揃えており、`@tamagui/config/v5`の`defaultConfig`をそのまま展開した上で、`light`/`dark`テーマに以下7キーだけを追加している。以前この設定にあったパステル配色・ベース色相の青緑tint・`$borderColor`をstep7へ昇格させる`getTheme`上書きは廃止済み(`$borderColor`は`@tamagui/config/v5`既定のstep4のまま、境界線のコントラストが低い箇所がある点は許容している)。
  - `background` / `styledHeaderColor` / `styledHeaderShadow` — `src/components/ui/primitives/StyledHeader.tsx`が`boxShadow`等で参照。
  - `cardShadow` — `src/components/ui/primitives/StyledCard.tsx`が`boxShadow`で参照。
  - `listItemHover` — `src/components/ui/layout-blocks/LayoutList.tsx`が`hoverStyle`で参照。
  - `headerFooterGradient` — `src/components/layout/Header.tsx`/`Footer.tsx`が`backgroundImage`で参照(生CSS注入は不要)。
  - `logoGlow` — 現状どのコンポーネントからも参照されていない(quaiz-front側でも未使用。上記「過去のセッションで見つかったハマりどころ」の`filter`propワークアウンド用に用意されている値)。
  - チャート機能(`PieChart`/`CalendarCard`/`LineChartCard`)で使う色は`tamagui.config.ts`のトークンではなく`src/lib/theme-gradients.ts`が`@tamagui/colors`から直接読む生のRadixカラー。quaiz-front側にチャート機能が無いため、この部分は当リポジトリ独自。

**Testing**: Vitest + jsdom + React Testing Library、テストは`*.test.ts(x)`としてソースの隣にcolocate。`vitest.setup.ts`が`matchMedia`(`// @vitest-environment node`を指定したテストは対象外)と`Element.prototype.scrollIntoView`(Tamaguiの`Select`が呼ぶがjsdomは未実装)をポリフィルする。

**パスエイリアス**: `@/*` → `./src/*`(`tsconfig.json`で設定、Vitestは`vite-tsconfig-paths`経由で解決)。

## 過去のセッションで見つかったハマりどころ

- **Tamaguiの`filter`propはtype上は存在するがWeb未実装**: `tamagui@2.6.0`/`@tamagui/core@2.6.0`の型は`filter`スタイルprop(例: `filter="drop-shadow(0 4px 8px $shadowColor)"`)を提供しているが、Webランタイムには実装されておらず(`native.cjs`のみ実装)、型チェックは通るのにCSSが一切出力されない。回避策は`style={{ filter: "drop-shadow(...)" }}`のように素の`style`propを使うこと。トークンとして一箇所で管理したい場合は`tamagui.config.ts`のtheme keyに追加し(`themes.light`/`themes.dark`双方に)、`style={{ filter: "var(--キー名)" }}`のようにCSS変数として参照する(Tamaguiは各theme keyを`--<キー名>`というCSS変数としてアクティブテーマにスコープして公開している)。
- **Next.js App Routerのfavicon規約(`app/favicon.ico`、`app/icon.svg`)は`app/`配下のみを見る**: `public/`に置いたファイルは対象にならない。SVGをfaviconと画像素材(`<Image>`のsrc等)で共用したい場合は`public/`に置いたまま、`src/app/layout.tsx`の`export const metadata = { icons: { icon: "/xxx.svg" } }`で明示的に指定する(`app/icon.svg`規約に頼ると同じファイルの二重配置が必要になる)。既定の`src/app/favicon.ico`を残したまま重複させないこと。
- **`next.config.ts`の`turbopack.root`**: ホームディレクトリ配下など、無関係な祖先ディレクトリに別の`package-lock.json`が存在する環境ではNext.jsがワークスペースルートを誤検出し、Reactが二重にロードされることがある。`turbopack.root`にこのプロジェクトのルートを明示することで回避している。

## 今後の指針

アプリ固有のドメインロジック(quizのCRUD、ユーザー管理等)が増えてきたら、`src/components/`直下に増やし続けるのではなく`src/features/<name>/{components,hooks,api,stores}`という単位に分割する(bulletproof-react型のレイヤリング)。`src/components/`配下は引き続き機能非依存のデザインシステム層として維持し、featureへ依存させない。ただし本テンプレートは現状デモページ中心の構成のため、featureが1つも無いうちは`src/features/`を先回りして作らない(YAGNI)。
