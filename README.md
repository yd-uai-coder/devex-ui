# devex-ui

[Devex](../README.md)(AIとの対話でヒアリングを行い、要件定義書・外部設計書・内部設計書・実装計画書の4種Markdownドキュメントを自動生成するシステム)のフロントエンドです。Next.js(App Router)+ Tamaguiで構築しています。

## Devexとしての主な機能

実際のDevex機能は`src/features/`配下に実装しています(バックエンドは[devex-api](../devex-api/README.md))。

- **認証**(`src/features/auth/`) — ログイン・ユーザー登録画面(`src/app/(pages)/login`・`register`)
- **ダッシュボード**(`src/features/dashboard/`、`/dashboard`) — プロジェクト一覧・新規作成導線
- **チャットヒアリング**(`src/features/hearing/`、`/projects/[id]/chat`) — AIとのチャットによるヒアリング。SSEでの応答ストリーミング、ヒアリング完了判定
- **ドキュメントプレビュー**(`src/features/documents/`、`/projects/[id]/documents`) — 生成された4種ドキュメントのタブ切り替え表示・ダウンロード、生成中のポーリング(`src/hooks/useGenerationPolling.ts`)

`src/components/ui/`配下は後述するデザインシステム/デモページ集であり、上記のDevex機能はその上に構築されています。

## セットアップ済みのスタック

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tamagui** — UIキット。`tamagui.config.ts` で設定し、`src/app/providers.tsx` の `TamaguiProvider` + `@tamagui/next-theme` の `NextThemeProvider` でアプリ全体をラップしています(config-onlyセットアップ。ビルド時最適化コンパイラは未導入)。アニメーション(`animation`/`transition`prop、`Sheet`等)には`@tamagui/config/v5-css`のCSSベースアニメーションドライバーを使用しています。
- **Zustand** — 状態管理。`src/lib/stores/` にストアを置く方針です
- **React Hook Form** + **Zod** + **@hookform/resolvers** — フォームバリデーション。スキーマは`src/lib/schemas/`に置く方針です(`LayoutForm.tsx`が実例、下記参照)
- **Vitest** + **React Testing Library** + **@testing-library/user-event** + **@testing-library/jest-dom** — テスト環境
- **SQLite** + **better-sqlite3** + **Drizzle ORM** — データ永続化用の簡易DB(`src/db/`)。`users`/`categories`/`keywords`の3テーブルにシードデータを投入済みで、`/db`ページから一覧を確認できます(下記「データベース」参照)。

TamaguiコンポーネントとZustandストアを組み合わせた最小限のカウンターデモ (`src/components/Counter.tsx`) は `/counter` ページに配置しており、メニューの「Counter」リンクから遷移できます。


## バックエンド連携(FastAPI前提)

このテンプレートは、別リポジトリで構築するFastAPIバックエンドとデータ連携するアプリの土台として使うことを想定しています。バックエンド自体はこのリポジトリに含まれず、`npm run dev`で起動されるものでもありません。

- `src/lib/api/client.ts`の`apiFetch<T>(path, init)`が唯一のHTTPクライアントです。`NEXT_PUBLIC_API_URL`(`.env.example`参照、未設定時は`http://localhost:8000`)を起点に、Accept/Content-Typeヘッダーの付与、`Authorization: Bearer <accessToken>`の自動付与、FastAPI/Pydanticのエラーレスポンス(`{detail: string}`または422時の`{detail: [{msg}, ...]}`)からのメッセージ抽出、`204 No Content`の扱いをまとめて担います。axios等の追加ライブラリは使わず、素の`fetch`をラップするだけの薄い実装です。
- 401(セッション切れ)を受け取ると、`src/components/auth/auth-store.ts`の`refreshTokens()`で1回だけ透過的にリフレッシュ→リトライを試み、失敗時は自動でログアウト状態に落とします。バックエンド側は`POST /api/v1/auth/refresh`が`{refresh_token}`を受け取り`{access_token, refresh_token}`を返す前提です(実際のエンドポイント仕様に合わせて`client.ts`の`REFRESH_PATH`と`auth-store.ts`のパスを調整してください)。
- Server Component/ISRページから認証不要な公開エンドポイントを取得する場合は、`apiFetch`ではなく`src/lib/api/server-fetch.ts`の`serverFetch<T>(path, revalidateSeconds)`を使います。`'server-only'`でガードされておりクライアント側からimportできません。失敗時は例外を投げずnullを返すため、バックエンド未起動時でもページ全体をクラッシュさせずに静的フォールバック等へ切り替えられます。
- バックエンドが起動していない状態で`Failed to fetch`(HTTPエラーではなく、リクエスト自体がサーバーに届いていないエラー)が出た場合は、まずバックエンド側のプロセス/コンテナが起動しているかを確認してください。

## APIへのデータ取得の方針

React Query/SWRのような専用ライブラリは導入せず、Zustandストア(1機能=1ストア)側に`data`/`status: AsyncStatus`/`error`/`fetchedAt`を持たせ、`src/lib/api/cache.ts`の`isCacheFresh(fetchedAt)`(既定TTL: 20秒)でstale判定する軽量な自前実装で鮮度を管理します。

- 取得時: ストアのfetchアクションが呼ばれるたびに`isCacheFresh(fetchedAt)`を見て、TTL以内ならAPIを叩かずキャッシュ済みの`data`をそのまま使う。
- 更新時: 何かを作成/更新/削除するmutationが成功したら、関係するストアの`fetchedAt`を`null`に戻す(invalidate)。次にその値を参照するコンポーネントがマウント/参照したタイミングで自然に再取得される。
- 常時マウントされているコンポーネント(サイドバー等)がポーリングし続けないように、`useEffect`の依存配列に`fetchedAt`自体を含めておくと、「他の場所でinvalidateされた時だけ」再フェッチが走るようになります。

## 認証ガードの雛形(`src/components/auth/`、`/others/protected-demo`)

FastAPI+JWTでの認証を前提としたUI側の雛形一式です。このテンプレート自体は実バックエンドを持たないため、`/others/protected-demo`ページではモックのトークンでログイン状態を再現していますが、実装(ストア・ガードコンポーネント)自体は実運用を想定した設計です。

- **`auth-store.ts`**: `accessToken`/`refreshToken`をZustandの`persist`でlocalStorageへ保存し(`status`/`error`は保存しない)、アクセストークンの`exp`(JWTペイロードをデコードして取得、署名検証はしない)の60秒前に自動でサイレントリフレッシュを仕掛けます。複数箇所から同時にリフレッシュが呼ばれても実処理は1回にまとめる(多重リフレッシュ防止)ため、`apiFetch`の401リトライと`onRehydrateStorage`(リロード復元後の再スケジュール)のどちらから呼んでも安全です。ログインAPI自体の形はアプリごとに異なるため、`login(accessToken, refreshToken)`はトークンを受け取って保存するだけの関数にしてあります。
- **`RequireAuth`**: `<RequireAuth>...</RequireAuth>`で囲んだ範囲を、未ログイン時はログイン必須ダイアログに差し替えます。
- **`GuardedLink`**: 通常の`next/link`と同じように使えるが、未ログイン時はクリックしても遷移せずログイン必須ダイアログを表示するリンクです。
- **`LoginRequiredDialog`**: 上記2つが表示する案内ダイアログ本体。ハードリダイレクトではなくダイアログで案内し、`?redirect=<元のパス>`付きで`loginHref`(既定`/login`)へ誘導します。`loginHref`/`registerHref`はpropsで指定でき、`registerHref`未指定時は登録ボタンを表示しません。実際の`/login`(・`/register`)ページ自体はアプリ固有のため、このテンプレートには含まれていません。

## データベース

[Drizzle ORM](https://orm.drizzle.team/) + [libSQL](https://turso.tech/libsql)(`@libsql/client` + `drizzle-orm/libsql`)によるSQLiteセットアップです(`src/db/`)。ローカル開発では`TURSO_DATABASE_URL`未設定時に自動的にローカルファイル`file:sqlite.db`へフォールバックするため、Turso契約なしでこれまで通り動作します。**`src/db/index.ts`は`server-only`パッケージでガードされており、Server Component / Route Handler / Server Actionからのみimportできます**(Client Componentからimportするとビルドエラーになります)。

以前は`better-sqlite3`(Node.jsネイティブモジュール+同期API)を使っていましたが、Vercelのサーバーレス実行環境はファイルシステムが基本読み取り専用(`/tmp`以外書き込み不可)で、かつ`.gitignore`対象の`sqlite.db`はデプロイ環境に存在しないため、そのままでは動作しませんでした。[Turso](https://turso.tech/)(libSQL)へ移行することで、同一のドライバのままローカル(ファイルモード)・本番(リモートTurso)を切り替えられるようにしています。libSQLドライバは非同期APIのため、DBを読むServer Componentは`async function` + `await`で呼び出します(`src/db/schema.test.ts`のみ、CI/ローカル専用の高速なインメモリテスト用に従来通り`better-sqlite3`を使用)。

```bash
npm run db:generate  # スキーマ(src/db/schema.ts)からマイグレーションSQLを生成 (drizzle/ 配下)
npm run db:migrate   # マイグレーションを実DB(ローカルはsqlite.db、TURSO_DATABASE_URL設定時はTurso)に適用
npm run db:seed      # マイグレーション適用 + サンプルデータ投入(既存データは洗い替え)
npm run db:studio    # Drizzle StudioでDBの中身をブラウザ確認
```

`sqlite.db`(実データファイル)は `.gitignore` 対象です。`drizzle/` 配下の生成済みマイグレーションSQLはスキーマ変更履歴としてコミットします。

テーブルは `users` / `categories` / `keywords` の3つで、いずれも同じカラム構成です(`id` INTEGER PRIMARY KEY、`name` TEXT NOT NULL、`created_at` / `updated_at` はUnixエポック秒で保存されるTIMESTAMP)。DB上のリレーション(外部キー)は持たせていません。`npm run db:seed`(`src/db/seed.ts`)で以下を投入します。

- `users`: `sample-user1`〜`sample-user20` の20件
- `categories`: 日本語の一般的なカテゴリー語(食べ物、旅行、スポーツ…)20件
- `keywords`: 各カテゴリーに関連する日本語キーワードを2〜3件ずつ(合計51件)

DBからのデータ取得はServer Component側で行い、表示はClient Componentとして分離する構成です(`/data/data-filter-sort`ページを参照)。

## Vercelへのデプロイ

このアプリは[Vercel](https://vercel.com/)へのデプロイを想定しています。全ページ、DBやその他の外部サービスへの依存が無い**SSG(静的生成)**です。DBを参照していた`/data/chart`・`/data/data-filter-sort`・`/form-parts/suggest`の3ページも、上記の通り`src/data/`の静的JSONスナップショットを参照する構成に変更したため、ビルド時に他ページと同様プリレンダリングされます(CSR専用のページはありません。いずれも静的シェルをプリレンダリングした上でクライアント側の操作に対応します)。

そのため、デプロイに特別な準備は不要です。GitHubリポジトリをVercelに接続すれば、標準のNext.js検出で`npm run build`が実行され、そのままデプロイできます(`vercel.json`も不要)。

DB/Tursoは実行時のデプロイ要件ではありませんが、`src/db/`一式は残しているため、将来DBを使った動的な機能を追加したい場合は「データベース」節を参照してください(Turso等のリモートDBを使う場合は`TURSO_DATABASE_URL`・`TURSO_AUTH_TOKEN`をVercelのEnvironment Variablesに登録します)。

### Devex固有のデプロイ手順(devex-api連携)

本アプリを実際のDevexプロジェクト(`src/features/`配下、`/dashboard`・`/projects/*`等)として動かす場合は、上記の一般的なVercelデプロイ手順に加えて以下が必要:

- VercelプロジェクトのEnvironment Variablesに `NEXT_PUBLIC_API_URL` を設定する(値: `devex-api`側の公開URL。`devex-api`はConoHa VPS上でDocker運用する構成で、詳細は[`devex-api/OPERATIONS.md`](../devex-api/OPERATIONS.md)参照)。未設定時は`http://localhost:8000`にフォールバックするため、本番デプロイ前に必ず設定すること。
- `devex-api`側の`CORS_ORIGINS`に、Vercelが割り当てたURL(またはカスタムドメイン)を追加しておくこと。未追加のままだと`/dashboard`・`/projects/*`等のAPI呼び出しがすべてCORSエラーになる。

### CI

`.github/workflows/ci.yml`が、push/PR時にlint・test・buildを実行します(デプロイは行いません)。実際のデプロイはVercelのネイティブGitHub連携が担い、Vercel側でこのリポジトリを一度接続すれば`main`へのpushで自動的にデプロイされます(追加のワークフロー不要)。詳細は[`devex-api/OPERATIONS.md`](../devex-api/OPERATIONS.md)「GitHub Actionsによる自動デプロイ」参照。

## セットアップ

```bash
npm install
cp .env.example .env.local  # FastAPIバックエンドのURLを指す場合はNEXT_PUBLIC_API_URLを編集(未設定でもhttp://localhost:8000にフォールバック)
```

## コマンド

```bash
npm run dev        # 開発サーバー起動 (http://localhost:3000)
npm run build      # 本番ビルド
npm run start      # 本番ビルドの起動
npm run lint       # ESLint
npm run test       # Vitestを一度だけ実行
npm run test:watch # Vitestをwatchモードで実行
npm run db:generate # Drizzleマイグレーション生成
npm run db:migrate  # マイグレーション適用
npm run db:seed     # マイグレーション適用 + サンプルデータ投入
npm run db:studio   # Drizzle Studio起動
```

## ディレクトリ構成(抜粋)

以前の版はリファクタ前の古いパスを含んでいたため、現在のソースツリーに合わせて全面的に書き直しています。

```
tamagui.config.ts          Tamaguiの設定(トークン/テーマ/フォント等)
next.config.ts              turbopack.rootを明示指定(下記「注意点」参照)
drizzle.config.ts          drizzle-kitの設定(スキーマ・マイグレーション出力先)
drizzle/                   生成されたマイグレーションSQL(コミット対象)
.env.example                環境変数のサンプル(NEXT_PUBLIC_API_URL)

src/app/providers.tsx      Tamagui + next-themeのProvider('use client')
src/app/layout.tsx         ルートレイアウト(Providersでchildrenをラップ)
src/app/(pages)/page.tsx   トップページ(MENU_TREEからリンクカードを生成)
src/app/not-found.tsx      404ページ

src/lib/api/client.ts      apiFetch<T>() — FastAPIバックエンド向けの薄いfetchラッパー(下記「バックエンド連携」参照)
src/lib/api/server-fetch.ts  Server Component/ISR用のserverFetch<T>()('server-only'、失敗時null)
src/lib/api/cache.ts       TTLキャッシュ判定(isCacheFresh)。react-query/SWRを使わずデータ鮮度を管理する軽量代替
src/lib/api/types.ts       AsyncStatus型など、APIまわりの共有型
src/lib/menu-tree.ts       サイドメニュー・トップページ・404ページが共有するナビゲーション定義(MENU_TREE)
src/lib/schemas/validation-rules.ts  汎用Zodバリデーションルール(フォームサンプル・入力チェックデモ共通)
src/lib/theme-gradients.ts 生カラー値のグラデーション/チャートパレット(トークン非対応箇所用)

src/components/auth/auth-store.ts        認証状態のZustandストア(JWTのexpに基づくサイレントリフレッシュ、persist)
src/components/auth/RequireAuth.tsx      未ログイン時にログイン必須ダイアログを出し保護対象を隠すラッパー
src/components/auth/GuardedLink.tsx      未ログイン時は遷移前にログイン必須ダイアログを出すLink
src/components/auth/LoginRequiredDialog.tsx  ログイン/登録への案内ダイアログ

src/components/layout/AppShell.tsx       ヘッダー/サイドメニュー/フッターを組み立てる全ページ共通シェル
src/components/layout/HierarchicalMenu.tsx  MENU_TREEを描画する階層型サイドメニュー
src/components/layout/menu-store.ts      サイドメニューの開閉状態Zustandストア

src/components/ui/primitives/  Button/Card/Input等、共通スタイルを適用した最小単位のUI部品
src/components/ui/form/        フォーム部品一式(Input系・バリデーションデモ・sample-form)
src/components/ui/data/        DataTable/DataFilter/DataSort/DataPagination/DataViewer等の汎用データ表示部品
src/components/ui/charts/      SVGベースのBar/Line/Pieチャートと、それぞれのCardラッパー
src/components/ui/layout-blocks/  LayoutTable/LayoutGrid/LayoutTabs/LayoutCarousel等、ページレイアウトの building block
src/components/ui/media/       Calendar/Gallery/Hero
src/components/ui/timer/       Timer/TimerPomodoro/TimerSetter(colocatedのtimer-store.ts)
src/components/ui/misc/        Counter(colocatedのcounter-store.ts)
src/components/errors/NotFoundContent.tsx  404ページの本文

src/hooks/  ページ・コンポーネント間で再利用する汎用カスタムフック置き場(下記「汎用カスタムフック」参照)

src/db/schema.ts            Drizzleのテーブル定義
src/db/index.ts             DBクライアント('server-only')
src/db/seed.ts               サンプルデータ投入スクリプト(tsxで実行)
src/db/export-json.ts        DBの内容をsrc/data/*.jsonへ書き出すスクリプト(下記「データベース」参照)
src/data/*.json              DB依存3ページが参照する静的JSONスナップショット

vitest.config.mts          Vitest設定(jsdom, testing-library連携)
vitest.setup.ts            jest-domのセットアップ + matchMedia/scrollIntoViewポリフィル(node環境向けにガード付き)
```

## 注意点

- このリポジトリは `next@16.2.12` という、訓練データより新しいNext.jsバージョンを使用しています。Next.js関連のコードを書く前に `node_modules/next/dist/docs/` 配下の該当ドキュメントを確認してください(詳細は `CLAUDE.md` 参照)。
- `next.config.ts` の `turbopack.root` は、ホームディレクトリ配下に無関係な `package-lock.json` が存在する環境でNext.jsがワークスペースルートを誤検出するのを防ぐため、明示的にプロジェクトルートを指定しています。

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tamagui Documentation](https://tamagui.dev/docs/intro/introduction)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Vitest Documentation](https://vitest.dev/)
