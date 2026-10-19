# CLAUDE.md

このファイルは、このリポジトリで作業するClaude Codeへのガイドです。

## これは何か

[Devex](https://github.com/yd-uai-coder/devex-project#readme) のフロントエンド。Next.js(App Router)+ Tamagui。バックエンドは別リポジトリの devex-api(FastAPI)。自作の UI テンプレートから作り始めたので、`src/components/ui/` の部品と `src/lib/api/` の方針はテンプレートに由来する(Devex で使わないデモページ・部品・DB は削除済み)。

コード・コメント・コミットメッセージ・ドキュメントは基本的に日本語です。機能一覧・アーキテクチャの概要は`README.md`を参照してください(本ファイルはアーキテクチャの意図と、セッションをまたいで再発しやすいハマりどころの記録に専念します)。

## コマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:3000, Turbopack)
npm run build         # 本番ビルド
npm run start          # 本番ビルドの起動
npm run lint            # ESLint (eslint-config-next core-web-vitals + typescript)
npm run test             # Vitestを一度だけ実行
npm run test:watch        # Vitest watchモード
npm run test:e2e          # Playwright(../devex-api を偽の LLM で起動する)
```

単一テストファイルの実行: `npx vitest run src/components/ui/data/__tests__/DataPagination.test.tsx`
名前でテストを絞り込む: `npx vitest run -t "テスト名の一部"`

既定の並列数だと、フォームのテストが時間切れ(5000ms)になることがある。そのときは `npx vitest run --maxWorkers=4` で流す。

## アーキテクチャ

**レンダリングモデル**: ログインが不要なページ(TOP・ログイン・登録)は静的に生成し、プロジェクトの画面(`/projects/[id]/...`)は動的。データはすべてクライアントから devex-api を呼んで取る(Server Component からの取得は無い)。

**ディレクトリ構成の意図**:
- `src/app/(pages)/` — ページ。`(protected)/` の下はログインが必要。ページは薄くし、Tamagui を使う本体は `src/features/` の Client Component に任せる。`src/lib/menu-tree.ts`の`MENU_TREE`(サイドメニュー・トップページ・404ページが共有)にページを足したら追記すること。
- `src/features/<name>/{components,api,hooks,*-store.ts,*Ops.ts,model.ts}` — 機能ごとのまとまり(bulletproof-react 型)。純粋な変換は `*Ops.ts`・`model.ts` に分け、部品から切り離してテストする。`demo/` は画面を作る前に仮データで見せ方を確かめた試作。
- `src/components/ui/` — 機能に依存しないデザインシステムの層(`primitives`/`form`/`data`/`layout-blocks`/`media`)。`features` を import しない。
- `src/components/layout/` — ヘッダー/サイドメニュー/フッター/トースト等、全ページ共通のアプリシェル(chrome)。
- `src/components/auth/` — 認証のストア・ガード・ログアウト。下記「バックエンド連携」参照。
- `src/hooks/` — 複数の機能で再利用するフック。「どのコンポーネントのために作ったか」ではなく「何を処理するか」を基準に命名する。
- `src/lib/api/` — バックエンド(FastAPI)との通信を担う層。下記参照。

**バックエンド連携(FastAPI前提)**: バックエンド(devex-api)はこのリポジトリに含まれず、`npm run dev`から起動されるものでもない。

- `src/lib/api/client.ts`の`apiFetch<T>()` — `NEXT_PUBLIC_API_URL`(`.env.example`参照、未設定時`http://localhost:8000`)を単一の設定源とする薄いfetchラッパー。`ApiError`(status+message+任意の`code`)、FastAPI/Pydanticの`{detail: string | [{msg}], code?: string}`形式のエラーパース(`code`は同じstatusの中で原因を見分けるために使う。例: 409 `VERSION_CONFLICT`)、`204 No Content`対応を持つ。**ドキュメント化された例外**: `src/lib/api/`は本来featureに依存しない層だが、`client.ts`だけは認証トークンの取得・401時のログアウトのために`src/components/auth/auth-store.ts`をimportしている。
- `src/lib/api/cache.ts` — React Query/SWRを使わない代わりのTTLキャッシュ判定(`isCacheFresh`、既定20秒)。各機能のZustandストアが`fetchedAt`を持ち、mutation成功時に`null`へ戻す(invalidate)ことで鮮度を管理する設計(詳細はREADME「設計の要点」)。
- `src/components/auth/auth-store.ts` — アクセストークンをメモリだけに持つ Zustand ストア(永続化しない)。リフレッシュトークンは devex-api が httpOnly Cookie で持ち、`bootstrap()`(`AuthBootstrap` がマウント時に1回呼ぶ)が Cookie から復元する。JWTの`exp`をデコードして期限の60秒前にサイレントリフレッシュを仕掛け、同時リフレッシュは1回にまとめる(`refreshPromise`による重複排除)。`RequireAuth`/`LoginRequiredDialog`と組み合わせて使う。ログインの印の cookie(`src/lib/auth-flag.ts`)を付け外しし、`src/proxy.ts` はそれを見てログイン済みのときに `/login`・`/register` を飛ばす(楽観的な確認。本当の確認は `RequireAuth`)。

- `src/features/auth/components/GoogleSignInButton.tsx` — Google でのログインのボタン(`@react-oauth/google`)。`NEXT_PUBLIC_GOOGLE_CLIENT_ID` が無ければ何も出さない。`GoogleOAuthProvider` はアプリ全体でなくこの部品の中に置き、ボタンのある画面でだけ Google のスクリプトを読み込む。`NEXT_PUBLIC_E2E_FAKE_GOOGLE=true`(`playwright.config.ts` が E2E の dev サーバーに渡す)のときは、偽の credential(`fake:<sub>:<email>`)を送る偽のボタンになる。どちらの値もビルドで埋め込まれるので、`process.env.NEXT_PUBLIC_...` と書き下して読む(`src/features/auth/google-config.ts`)。

**テーマ設定(`tamagui.config.ts`)**: `@tamagui/config/v5`の`defaultConfig`をそのまま展開した上で、`light`/`dark`テーマに以下3キーだけを追加している(`$borderColor`は`@tamagui/config/v5`既定のstep4のまま、境界線のコントラストが低い箇所がある点は許容している)。
  - `background` — ページの背景。
  - `cardShadow` — `src/components/ui/primitives/StyledCard.tsx`が`boxShadow`で参照。
  - `headerFooterGradient` — `src/components/layout/Header.tsx`/`Footer.tsx`が`backgroundImage`で参照(生CSS注入は不要)。

**Testing**: Vitest + jsdom + React Testing Library、テストは`*.test.ts(x)`としてテスト対象と同じディレクトリ直下の`__tests__/`サブフォルダに置く(Jest由来でJS界隈での認知度が高い規約。以前はソースの隣に直接colocateしていたが、ソース側の見通しを優先してこの構成に移行した)。相対importはテスト対象のファイルが1階層上になる分(`./Foo`→`../Foo`、`../../tamagui.config`→`../../../tamagui.config`等)深さが1つ増える点に注意。`vitest.setup.ts`が`matchMedia`(`// @vitest-environment node`を指定したテストは対象外)と`Element.prototype.scrollIntoView`(Tamaguiの`Select`が呼ぶがjsdomは未実装)をポリフィルする。

**パスエイリアス**: `@/*` → `./src/*`(`tsconfig.json`で設定、Vitestは`vite-tsconfig-paths`経由で解決)。

## 過去のセッションで見つかったハマりどころ

- **Tamaguiの`filter`propはtype上は存在するがWeb未実装**: `tamagui@2.6.0`/`@tamagui/core@2.6.0`の型は`filter`スタイルprop(例: `filter="drop-shadow(0 4px 8px $shadowColor)"`)を提供しているが、Webランタイムには実装されておらず(`native.cjs`のみ実装)、型チェックは通るのにCSSが一切出力されない。回避策は`style={{ filter: "drop-shadow(...)" }}`のように素の`style`propを使うこと。トークンとして一箇所で管理したい場合は`tamagui.config.ts`のtheme keyに追加し(`themes.light`/`themes.dark`双方に)、`style={{ filter: "var(--キー名)" }}`のようにCSS変数として参照する(Tamaguiは各theme keyを`--<キー名>`というCSS変数としてアクティブテーマにスコープして公開している)。
- **Next.js App Routerのfavicon規約(`app/favicon.ico`、`app/icon.svg`)は`app/`配下のみを見る**: `public/`に置いたファイルは対象にならない。SVGをfaviconと画像素材(`<Image>`のsrc等)で共用したい場合は`public/`に置いたまま、`src/app/layout.tsx`の`export const metadata = { icons: { icon: "/xxx.svg" } }`で明示的に指定する(`app/icon.svg`規約に頼ると同じファイルの二重配置が必要になる)。既定の`src/app/favicon.ico`を残したまま重複させないこと。
- **`next.config.ts`の`turbopack.root`**: ホームディレクトリ配下など、無関係な祖先ディレクトリに別の`package-lock.json`が存在する環境ではNext.jsがワークスペースルートを誤検出し、Reactが二重にロードされることがある。`turbopack.root`にこのプロジェクトのルートを明示することで回避している。
- **Server Componentから`tamagui`を直接importすると`TypeError: createReactContext is not a function`になる**: Reactは`package.json`の`exports`に`"react-server"`条件専用のビルド(`react.react-server.js`)を持ち、Server Component(`"use client"`の無いモジュール)からimportされた`react`はこのビルドに解決される。このビルドには`Context` API(`React.createContext`)が存在しない(クライアント専用の概念でRSCには無関係なため意図的に除外されている)。`@tamagui/web`の内部(`createStyledContext`)はモジュール評価時に`React.createContext`を呼ぶため、Server Componentから`tamagui`を直接importするコンポーネントは必ずこのエラーで落ちる。回避策は該当ファイルに`"use client"`を追加するか、tamaguiを使う部分を別のClient Componentに切り出して描画を委譲すること(`params`の非同期解決が必要な動的ルートではこちらを使う)。Next.js 16 + React 19 + Tamagui 2.6の組み合わせ特有の制約。
- **CSS ModuleでTamaguiの部品の`display`等を上書きすると、本番ビルドだけ負ける**: Tamaguiの`YStack`/`XStack`には`.is_View { display: flex; flex-direction: column; … }`が付く。本番ビルドでは、このTamaguiの`<style>`がCSS Moduleの`<link>`より後ろに入るため、同じ詳細度(クラス1つ)の`.grid { display: grid }`などが負ける。開発サーバーではCSS Moduleが後から差し込まれるので再現しない(開発で横並び・本番で縦1列、の食い違いになる)。`display`・`flex-direction`・`min-width`など`.is_View`が持つ値をCSS Moduleで決めたい入れ物は、素の`<div className={styles.x}>`にする(`LayoutGrid`がこの形)。確かめるときは`npm run build && npx next start`で見る。
