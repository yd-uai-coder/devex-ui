# next-tamagui-templates

[Next.js](https://nextjs.org)(App Router)+ [Tamagui](https://tamagui.dev) によるUIテンプレート集です。目的は2つ:

1. UIデザインにおける使いやすいサンプルであること
2. このリポジトリをcloneすれば、今後のアプリ開発で開発とテストがスムーズに進められること

## セットアップ済みのスタック

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tamagui** — UIキット。`tamagui.config.ts` で設定し、`src/app/providers.tsx` の `TamaguiProvider` + `@tamagui/next-theme` の `NextThemeProvider` でアプリ全体をラップしています(config-onlyセットアップ。ビルド時最適化コンパイラは未導入)。アニメーション(`animation`/`transition`prop、`Sheet`等)には`@tamagui/config/v5-css`のCSSベースアニメーションドライバーを使用しています。
- **Zustand** — 状態管理。`src/lib/stores/` にストアを置く方針です
- **React Hook Form** + **Zod** + **@hookform/resolvers** — フォームバリデーション。スキーマは`src/lib/schemas/`に置く方針です(`LayoutForm.tsx`が実例、下記参照)
- **Vitest** + **React Testing Library** + **@testing-library/user-event** + **@testing-library/jest-dom** — テスト環境
- **SQLite** + **better-sqlite3** + **Drizzle ORM** — データ永続化用の簡易DB(`src/db/`)。`users`/`categories`/`keywords`の3テーブルにシードデータを投入済みで、`/db`ページから一覧を確認できます(下記「データベース」参照)。

TamaguiコンポーネントとZustandストアを組み合わせた最小限のカウンターデモ (`src/components/Counter.tsx`) は `/counter` ページに配置しており、メニューの「Counter」リンクから遷移できます。

## コンポーネントサンプル: copy-theme

[tamagui.dev/theme](https://tamagui.dev/theme) のダッシュボードモックアップ部分を再現したページです(`/copy-theme`、メニューの「コンポーネントサンプル 3」からアクセス)。テーマカラー調整機能(入力欄・スライダーpanel等)やサイト共通chrome(ナビバー・フッター・カラースワッチの帯)は対象外とし、**実際のダッシュボードカード群のみ**を再現しています。加えて、除外した右側パネルの位置に、Tamagui標準の`Slider`を使った独自の「Volume」コンポーネントを追加しています。

- `src/components/theme-demo/` — ページ固有の「コンポーネント」(New User Sign-ups、Revenue Growth、Subscribe、Traffic Sources、Calendar、Group Chat、Tasks、Kitchen Sink、Account Menu、Welcome Back、Migrate to V2、Volumeの12種)。Avatar/Checkbox/RadioGroup/Switch/Select/Progress/ToggleGroup/Separator/ListItem/SliderなどTamagui標準コンポーネントを組み合わせて構成しています。
- `src/components/parts/` — Tamaguiに標準で用意されていない「パーツ」(BarChart、LineChart、PieChart、ChatBubble、TaskListItem、Calendar)。ミニグラフ類はSVG、Calendarは月間カレンダーグリッドをゼロから実装しています。

## フォーム部品

`src/components/parts/form/` に、Tamagui標準のフォーム系コンポーネント(Checkbox/RadioGroup/Select/Slider/Switch/Input/TextArea)に「ラベル+ステータス色」を付けたラッパー群を置いています(`/components/forms`ページ、`src/app/(pages)/components/forms/page.tsx` でまとめて確認できます)。

- `CheckboxWithLabel` / `RadioGroupWithLabel` / `SelectGroupWithLabel` / `SwitchWithLabel` — いずれもラベルのテキスト部分をクリックするだけで、対応するチェックボックス・ラジオ・セレクト・スイッチが選択される標準的なフォームUXになっています(ネイティブの`<label for="...">`挙動を利用。`React.useId()`で一意なidを生成しているため、同じページに複数個並べてもラベルのクリック先が混線しません)。
- `RadioGroupWithLabel` / `SelectGroupWithLabel` は、選択肢を `items: { value: string; label: string }[]` という配列で渡すだけでよい1ファイル1関数構成です(公式サンプルにある個別Item用コンポーネントとの2関数構成をあえて統合しています)。`RadioGroupWithLabel`は`orientation`prop(`"horizontal"`(デフォルト) / `"vertical"`)で選択肢の並び方向を切り替えられ、`label`propでグループ全体のラベルも表示できます。各選択肢のラジオボタンとテキストの間隔は詰めており、ラジオボタン自体は`src/components/parts/form/radio/RadioGroupItem.tsx`(`textSize`propで渡したテキストサイズより常に1段階小さいサイズで描画。ホバー・選択(フォーカス)・押下いずれの状態でも境界線が消えないようスタイルも調整済み)経由で表示しています。
- `SelectGroupWithLabel`のモバイル用ボトムシートは、背後のページがうっすら透けて見える半透明の暗幕(`backgroundColor="rgba(0,0,0,0.5)"`)で覆われます(Tamagui標準のままだとページ背景色と同じ不透明な板になり、開いている間ヘッダー等が完全に見えなくなるため明示指定しています)。
- `SliderWithLabel` — ラベルの横に現在値を常時表示します(`unit` propで`%`や`cm`等の単位文字列を末尾に付与可能)。Sliderはクライアント計測レイアウトに依存するため、内部で`ClientOnly`を使いマウント後にのみ描画してhydrationミスマッチを避けています。`size`(全体サイズ)とは別に`thumbSize`propでつまみ(Thumb)だけの大きさを個別に指定できます。
- `TextAreaWithLabel`(`input/`配下) — `InputSimpleText`と同じ「ラベル+ステータス色」構成の複数行入力欄です(`Input`ではなく`TextArea`を使用)。ラベルは`SliderWithLabel`と同じく入力欄の上に縦配置されます。
- `status?: "default" | "success" | "warning" | "error" | "disabled"` prop で、ラベル・コントロールの色を`<Theme>`ごと連動して切り替えられます。
- `labelWidth?: number | SizeTokens` prop を全コンポーネントに用意しており、同じ値を複数フィールドに指定すると入力欄の開始位置をテーブルのように揃えられます(ラベルが入力欄より先に来ない`CheckboxWithLabel`/`SwitchWithLabel`は対象外)。`size` propはラベル側のフォントサイズにも連動します。
- 各コンポーネントの最外殻には`marginBottom="$6"`を設定しており、ラベルと自分の入力欄は間隔を詰めて一つの塊に見せつつ、次のフィールドとは明確に間隔を空けることで「どのラベルがどの入力欄に対応するか」を視覚的にグルーピングしています。
- `width?: number | SizeTokens` prop(デフォルト`300`)を全コンポーネントに用意しており、行全体(ラベル+入力欄)の幅を呼び出し側から上書きできます。デフォルトの`300`は既存ページ(`/components/forms`)の見た目を変えないための後方互換値で、より広い幅で使いたい場合(`/forms`ページ等)は`width="100%"`等を明示的に渡してください。
- **ラベルと入力欄の並びはレスポンシブです**(`InputSimpleText`/`InputPassword`/`InputSearch`/`RadioGroupWithLabel`/`SelectGroupWithLabel`が対象)。`md`ブレークポイント(768px)未満のモバイル幅ではラベルが上・入力欄が下の縦並び(間隔は最小限)、768px以上のPC幅では従来どおりの横並びに切り替わります。`CheckboxWithLabel`/`SwitchWithLabel`(コンパクトなトグル系コントロール)と`SliderWithLabel`/`TextAreaWithLabel`(値の視認性・複数行入力の理由で元々常に縦並び)は対象外です。
- `SelectGroupWithLabel`はモバイル(タッチ操作)では`Adapt`+`Sheet`でボトムシート表示に切り替わります(`max-md`ブレークポイント)。タッチ環境で素のドロップダウンだと選択確定前に閉じてしまう問題への対処です。ボトムシートはアニメーション無しで即座に開閉します(フェード付きだと開閉の数百msの間、画面全体が薄暗いまま残り選択肢以外の表示が消えたように見えるため)。
- `CheckboxWithLabel`/`RadioGroupWithLabel`のチェック欄の境界線は、ライトモードでの視認性向上のため`$color7`を明示指定しています。同じ理由で`InputSimpleText`/`InputPassword`/`InputSearch`/`TextAreaWithLabel`/`SelectGroupWithLabel`の入力欄本体にも`borderColor="$color7"`を指定しており、Tamaguiデフォルトの`$borderColor`だと入力欄自身の背景とほぼ同化して境界がわかりにくい問題を解消しています。
- **既知の制約**: Tamaguiの`Select`は`name`propを型として受け付けるものの、内部でどのDOM要素にも反映しない(`RadioGroup`はhidden `<input type="radio" name="...">`をバブル用に描画するが、`Select`には同等の仕組みが無い)。ネイティブの`FormData`送信を行う場合はこの制約に注意すること。
- `errorMessage?: string` prop を `InputSimpleText`(→`InputEmail`も自動対応)/ `InputPassword` / `TextAreaWithLabel` / `RadioGroupWithLabel` / `SelectGroupWithLabel` / `CheckboxWithLabel`(このコンポーネントのみ新規に`status` propも追加)に用意しています。渡すと`status`を明示指定しなくても自動的にエラー用の赤テーマになり、フィールド直下に文言が表示されます(`LayoutForm.tsx`で実践)。

### 入力サジェスト(`InputSuggest`、`/sample/suggest`)

`src/components/parts/form/input/InputSuggest.tsx`は、`<InputSimpleText>`・生の`<Input>`のどちらもラップして使えるサジェスト(オートコンプリート)コンポーネントです。

```tsx
<InputSuggest suggestions={["ラーメン", "寿司", "カレー"]} onValueChange={setValue}>
  <InputSimpleText label="キーワード" />
</InputSuggest>
```

- `children`(`<InputSimpleText>`または生`<Input>`を1つ)を`cloneElement`で複製し、`value`/`onChangeText`を注入する方式です。両コンポーネントはTamaguiの`InputProps`(`value`/`onChangeText`)を共有しているため、同じ仕組みでどちらもラップできます。
- `suggestions: string[]`prop に渡した候補配列から、入力値の部分一致(大文字小文字を区別しない)をドロップダウン表示します(既定で最大8件、`maxSuggestions`propで変更可)。候補をクリックすると入力値が置き換わります。
- ドロップダウンの表示・位置決めは`DatePickerWithLabel`と同じくTamaguiの`Popover`を使っており、クリックアウトサイド・Escapeキーでの自動クローズが標準機能として使えます。
- **既知の制約**: `<InputSimpleText>`をラップする場合、Popoverの位置決めの基準は`InputSimpleText`のルート要素(ラベル+入力欄の行全体)になるため、PC横並びレイアウトではドロップダウンがラベルの左端から始まり、入力欄の左端には厳密には揃いません。
- `/form-parts/suggest`ページで、DBの`keywords`テーブル(`src/db/schema.ts`)から取得した値をサジェストリストに使う例を、`InputSimpleText`版・生`Input`版の両方で確認できます。両方の入力例に「入力必須+10文字以内」のバリデーションを実装しており(`validation-rules.ts`の汎用ルール関数を使ったページローカルなZodスキーマを値変更のたびに`safeParse`する軽量な方式)、フォーカスを外す(`onBlur`)まではエラー表示しません。
- 同ページには、`suggestions`配列の全件をTamagui標準の`ListItem`(`tamagui`から`export`)で1件ずつ表示する「候補リスト」も並べて配置しています。ドロップダウンで絞り込まれる候補とは別に、入力可能な単語の全量を一覧できます(`maxHeight`+`overflow="scroll"`のコンテナに収めたスクロール可能な一覧)。

## サンプルページ: フォーム送信フロー(`/forms`)

`src/app/(pages)/(samples)/forms/` に、上記フォーム部品を組み合わせた実践的なサンプルフォームを配置しています(`/forms`ページ)。入力項目のラベル・`name`属性はユーザー提供のスプレッドシート(名前=`user`・メール=`mail`・パスワード=`password`・同意する=`agree`・好きな動物=`animal`・好きな食べ物=`fruit`・その他=`note`)に準拠しています。

- ページ上部の`SwitchWithLabel`で、送信ボタン押下後の挙動を切り替えられます。ON(デフォルト)は同じページ内に`AlertDialog`(https://tamagui.dev/ui/alert-dialog)を表示して入力内容を確認、OFFは`/forms/comfirm`ページへ遷移して確認します(パスワードはどちらの表示でもマスクされます)。
- ページ間のデータ受け渡しは`src/lib/stores/sample-form-store.ts`のZustandストア経由です(クエリパラメータやサーバー側の永続化は使っていません)。`/forms/comfirm`に直接アクセスした場合(ストアが空の場合)は「まだ送信されていません」という案内を表示します。
- **`src/components/layout/form/LayoutForm.tsx`(`/layout/form`ページ)は、上記フォームを`/copy-theme`ページ(`WelcomeBackCard`/`SubscribeCard`等)と同じ配色言語に揃えた版です**。フォーム全体を`<Theme name="green">`でラップし、各入力欄のフォーカス枠・選択状態の色を緑系に統一。送信ボタンは`SolidButton`(`src/components/SolidButton.tsx`)と同じ配色・hover/press挙動(`backgroundColor="$color9"` + 明示的なhover/press色)を`FormGeneral`の新設`buttonProps`経由で適用しています。`FormGeneral`自体はこのpropを省略すれば従来どおり無装飾のボタンになるため、`/components/forms`カタログページ側の見た目には影響しません。
- `FormGeneral`(`src/components/parts/form/FormGeneral.tsx`)に`onSubmitted?: () => void`propを追加し、送信の2秒デモスピナーが終わったタイミングでこのサンプルページ側の分岐処理を呼び出せるようにしています。
- **`LayoutForm.tsx`はReact Hook Form(RHF)+ Zodでバリデーション・セキュリティ機能を実装しています**。バリデーションルールは`src/lib/schemas/sample-form-schema.ts`の`sampleFormSchema`(Zodオブジェクトスキーマ、Vitestテスト付き)に集約しており、クライアント側の簡易チェックである旨をコード内に明記しています(このプロジェクトには実際のバックエンドが無いため。本番相当のサーバーを持つ場合は必ずサーバー側でも再検証が必要)。`LayoutForm.tsx`では7フィールドそれぞれを`Controller`(RHF)でラップし、`useForm({ resolver: zodResolver(...) })`で送信時に検証します。`FormGeneral`に新設した`onBeforeSubmit?: () => boolean | Promise<boolean>`経由で、RHFの非同期バリデーションを待ってからスピナー状態に入るようにしています。一度出たエラーは、RHF既定の`reValidateMode: "onChange"`により該当フィールドを編集すると自動で再検証されます。セキュリティ機能もZodで表現しています: ハニーポット項目(`name="website"`)は`sampleFormSchema.extend({ honeypot: z.string().max(0) })`という「空文字以外は不正」なフィールドとして本体スキーマに統合しており(専用のstate・専用チェックを持たない)、埋まっていた場合はエラー表示のないフィールドとして検証失敗するため、他の正当なエラー表示に紛れて黙って送信がブロックされます(単純なボット対策)。確認用のZustandストア(`sample-form-store.ts`)には`sampleFormSchema.transform(({ password, ...rest }) => ({ ...rest, passwordLength: password.length }))`という変換スキーマ(`sampleFormSubmissionSchema`)を通してから保存しており、平文パスワードを保持せず`passwordLength`(文字数)のみを保持します。フィールド構成はユーザー提供のスプレッドシート「フォーム」シートに準拠しており、名前(全角10文字以内)・郵便番号(`postCode`、ハイフンなし7桁・必須)・電話番号(`phonNum`、ハイフンなし10〜11桁・必須)・その他(全角のみ)を含みます(メール・パスワードはシート上も「変更なし」)。郵便番号・電話番号のバリデーションは`/sample/validations`ページの`PostalCodeRules`/`PhoneRules`デモと同じ`validation-rules.ts`のルール関数(`postalCode7Digits`/`digitsOnlyPhone`)をそのまま再利用しています。
- **`sampleFormSchema`のバリデーションルールは`src/lib/schemas/validation-rules.ts`の汎用ルール関数で組み立てています**。「必須」(`requiredText`/`requiredSelection`)・「文字数上限/範囲」(`maxLength`/`lengthRange`)・「真偽値必須」(`requiredTrue`)という、複数フィールドで繰り返し登場するパターンをフィールドラベル(+必要な数値)を渡すだけで組み立てられる関数として切り出し、`applyRules(baseSchema, ルール関数...)`で合成しています(例: `applyRules(z.string().trim(), requiredText("名前"), maxLength("名前", 50))`)。メール形式の正規表現マッチやパスワードの英数字混在チェックのような、そのフィールド固有の1回限りの判定ロジックは汎用化せず、`applyRules(...)`の結果に個別の`.refine()`をチェーンする方針です。`validation-rules.ts`は`src/lib/schemas/`に置いているため、将来別のフォームスキーマを作る際にも同じルール関数をimportして使い回せます。
- ページ全体は`maxWidth={640}`のカラムに収まるようにセンタリングしています(PC表示で入力欄が画面幅いっぱいに間延びするのを防ぐため)。
- モバイル幅で選択肢が画面外にはみ出さないよう、`RadioGroupWithLabel`は選択肢が収まらない場合に自動で折り返します。
- 名前・パスワード欄がブラウザのオートフィル判定でリロード毎にグレー背景を一瞬表示する問題に対処し、常にテーマ通りの背景色で表示されるようにしています(`src/app/globals.css`)。

## バリデーションルール確認ページ(`/sample/validations`)

`src/lib/schemas/validation-rules.ts`に実装した汎用ルール関数を、1つずつ実際に試せるデモページです。ユーザー提供のスプレッドシート「バリデーションルール」シートに沿って、必須チェック・文字種類・文字数・数値・日付・メールアドレス・電話番号・郵便番号・パスワード・チェックボックス・セレクトボックス・クロスフィールドの12カテゴリ・約55件のルールを網羅しています(パスワードの「辞書語禁止」は本物の辞書データが無いため対象外)。

- **12カテゴリを3ブロック(基本ルール/書式ルール/応用ルール、各4カテゴリ)に分け、ブロックごとに独立した`LayoutTabs`(`src/components/layout/tabs/LayoutTabs.tsx`、`tamagui`の`Tabs`を汎用化したラッパー)でカテゴリを切り替えます**。12個を1つの`Tabs`に詰め込むとタブ自体が使いにくくなるための構成です。`LayoutTabs`は`tabLabel: string[]`(タブラベル、そのまま値としても使う)と`content: ComponentType[]`(対応するコンテンツの関数コンポーネント配列、同じ順番)を渡すだけでTabs.List/Tabs.Contentを自動生成する汎用コンポーネントで、呼び出し元(このページ)はラベルとコンポーネントの配列を用意するだけで済みます。`Tabs.Tab`は既定では選択中/非選択の見た目に差が無いため、選択中のタブのみ`theme="green"` + 緑背景 + 白文字になるよう明示的にスタイルしています(`ToggleGroup`の選択状態表現(`KitchenSinkCard.tsx`)と同じパターン、`LayoutTabs`内部の`ThemedTab`で実装)。
- 各ルールは「見出し + 説明文 + 最低限の入力欄 + 確認ボタン + 結果`AlertDialog`(「入力に成功しました！」/「入力に失敗しました。入力条件を確認してください。」)」という同じ形のカードで統一しており、この繰り返し部分は`src/components/parts/form/validation/shared.tsx`の`useRuleCheck`(1ルール=1つの独立した`useForm`インスタンス)・`RuleSection`に切り出しています。カテゴリ単位で`src/components/parts/form/validation/`配下にファイルを分割しています(`RequiredRules.tsx`等12ファイル)。
- **不正な値を実際に入力できるUIを優先しています**(このページの目的が「不正な値で確認すると失敗する」ことを見せるデモのため)。ネイティブ`type="number"`のように不正な文字種をそもそも入力させないUIは避け、数値系ルールもプレーンテキスト入力(`InputSimpleText`)で文字列として数値の妥当性を検証します。日付系も「日付形式/時刻形式/日時形式」(文字列としての形式検証)はテキスト入力、「今日以降/過去のみ/生年月日が妥当」等の日付比較は後述の`DatePickerWithLabel`(過去日・未来日を問わず任意の日付を選べる)を使います。
- **「ポリシーの言い換え」にあたるルールは、同じチェック関数を異なるラベル・説明文で使い回しています**(重複関数を作らない方針)。例: 数値の「小数可」「負数可」は、より制限の強い「整数のみ」「正数のみ」の対として存在するだけで、実質「数値のみ」チェックと同じ挙動のため`numericOnly`を使い回しています。
- **新規`src/components/parts/form/DatePickerWithLabel.tsx`**: 他の`*WithLabel`と同じAPI(`label`/`labelWidth`/`errorMessage`等)を持つ日付選択コンポーネント。`Popover`(`tamagui`)でカレンダーをポップアップ表示します。既存の`src/components/parts/Calendar.tsx`(`/copy-theme`ページ向け、表示専用で`value`/`onValueChange`を持たない)とは別に新規実装しています。年月移動は自由に行え、どの日付も選択可能です(過去日のみ許可のような制限はUI側ではかけず、送信時のZodスキーマ側で検証する、という他ルールと同じ設計方針のため)。トリガーの`Button`には`suppressHydrationWarning`を付与しており、多数の同種`Button`が同時マウントされることで起きていたhydrationミスマッチ警告を、描画を遅延させずに解消しています(`ClientOnly`で描画自体を遅延させる方式も試したが、トリガー表示に1〜2秒のラグが生じたため採用していません)。
- **新規`src/components/parts/form/CheckboxGroupWithLabel.tsx`**: `RadioGroupWithLabel`と同じ「1コンポーネントでグループ全体を表す」設計の複数選択チェックボックス。`items`配列 + `value: string[]`/`onValueChange`で選択状態を管理します。グループ全体の`<Label>`・`Theme`によるステータス連動・`errorMessage`表示を担当し、チェックボックス一覧自体の描画は`<Label>`を持たない`CheckboxGroup`(`src/components/parts/form/checkbox/CheckboxGroup.tsx`、`RadioGroupItem`と同様の「部品を切り出す」設計)に委譲しています。呼び出し側が既に別の場所でフィールド名を表示しておりグループラベルが不要な場面(`DataFilter`の絞り込み条件UIなど)では`CheckboxGroup`を直接使えます。

## 汎用テーブルレイアウト(`LayoutTable`)とテーブル形式フォーム(`/forms/table`)

`src/components/layout/table/LayoutTable.tsx` は、任意の配列データを渡すと行・列を自動生成する汎用テーブルコンポーネントです。`columns`を省略すると配列内オブジェクトのキーからヘッダー・列を自動生成し、明示的に`columns: { key, header？, width? }[]`を渡せば列の見出しや幅(例: ラベル列だけ固定幅、残りは可変幅)を個別指定できます。セルの中身は文字列だけでなく任意のReactNode(フォーム部品など)を置けます。セルの余白はモバイル幅では詰め(`$1`)、`md`ブレークポイント(768px)以上では通常幅(`$3`)に広がるレスポンシブpaddingです。列構成は行ごとではなく1度だけ決定され、全行が必ず同じ列数分のセルを描画するため、値に`null`/`undefined`が含まれていても列がズレることはありません(空欄になるだけ)。セルの値が`null`/`undefined`の場合は、通常セルより薄い色(`$color9`)で`emptyPlaceholder`prop(既定`"-"`)の内容を表示します(空文字列`""`はNULLとは意味が異なるため対象外で、そのまま空欄表示されます)。

このLayoutTableを使い、`/forms`ページと同じ入力項目を「ラベル列|入力欄列」のテーブルレイアウトで組んだサンプルが`/forms/table`ページです(`src/components/layout/form/FormTable.tsx`、`/layout`ページにも表示例として配置しています)。`parts/form/`の`*WithLabel`部品群はラベルを自前で内包する設計のため、テーブル側で既にラベル列を持つこの構成とは相性が悪く(二重ラベルになる)、代わりにTamagui標準のInput/Checkbox/RadioGroup/Select/TextAreaを直接使っています。送信すると`/forms`ページと同じZustandストア(`sample-form-store.ts`)経由で`/forms/comfirm`確認ページに遷移します。

## 汎用カルーセル(`LayoutCarousel`、`/layout/carousel`)

`src/components/layout/carousel/LayoutCarousel.tsx`は、元々Tailwindベースで実装されていた`src/components/parts/carousel/`のカルーセルを、可能な限りTamaguiコンポーネントで再現し直したものです。`children`に任意個の`LayoutCarouselSlide`(または任意の要素)を並べるだけで、ドラッグ/スワイプでの手動切り替え・左右の矢印ボタン・`intervalSeconds`prop指定時の自動再生(ドラッグ中・フォーカス中は一時停止)が使えます。矢印ボタンは`Button`(`circular`+`lucide-react`の`ChevronLeft`/`ChevronRight`アイコン、既存の`MenuToggleButton`等と同じアイコン指定方法)、コンテナ・スライドのレイアウトは`XStack`/`YStack`で構成しています。スライドの水平位置(ドラッグ量に応じて連続的に変化する`translateX(%)`)と遷移時間(`transitionDurationMs`propで自由なミリ秒数を指定可能)だけは、Tamaguiのトークンベースのアニメーションシステム(プリセット名または離散的なpx値が前提)で表現できないため、その部分のみ`style`propで生CSSを指定しています(`src/lib/theme-gradients.ts`のグラデーション同様、Tamaguiのトークン体系で表現しきれない箇所は素のCSSを使うという既存パターンを踏襲)。`/layout/carousel`ページで手動切り替え版・自動再生版の2例を確認できます。

表示は4つの独立したpropsで組み合わせて指定します(以前は`variant`という1つの離散プリセットでしたが、個別に調整できるよう分解しています)。
- `visibleCount?: number`(既定`1`): 同時に完全表示するスライド件数。
- `dim?: boolean`(既定`false`): 非activeなスライドに半透明の暗幕(`rgba(0,0,0,0.5)`)を重ねるか。暗幕は`pointerEvents="none"`のため、暗幕越しでもドラッグでスライド送りができる。
- `peekFraction?: 0 | 0.15 | 0.3`(既定`0`): 左右のチラ見せ幅(アイテム幅に対する比率)。自由な数値ではなく3段階の離散値のみ受け付ける。
- `slideSize?: "w-full" | "content-full" | "grid"`(既定`"content-full"`): `"content-full"`は親コンテナの幅いっぱい(従来通り)、`"w-full"`はページ本文の横paddingをはみ出しビューポート端まで広がるフルブリード、`"grid"`は各スライドの縦横比を1:1に固定する。

例えば旧`variant="peek"`相当は`peekFraction={0.15} dim`、旧`variant="grid"`相当は`visibleCount={2} peekFraction={0.15} slideSize="grid"`で再現できます。前後ボタン・ドラッグの1操作は、`visibleCount`をいくつに設定していても常に1件だけ進む(まとめてページングする動きにはしない)という統一された操作感になっています。

**`slideSize="w-full"`は、`AppShell`のコンテンツ領域が`paddingHorizontal="$4"`のみ(中央寄せの`maxWidth`コンテナが無い)という構造を活かし、一般的な「フルブリード」CSSトリック(`width:100vw` + `margin-left/right: calc(-50vw + 50%)`)でビューポート端まで広げています**。`globals.css`の`overflow-x: clip`(`/copy-theme`ページの項を参照)により、この意図的なはみ出しがページ全体の横スクロールを引き起こすことはありません。

**最後のスライドから「次へ」進む(またはその逆)と、逆戻りするような動きにならず、そのまま同じ方向へ流れ続けて最初(または最後)のスライドに切り替わります**(無限ループ)。実スライドの前後に複製(クローン)を配置しておき、クローン領域への遷移アニメーションが完了した瞬間にアニメーション無しで対応する実スライド位置へ裏側で戻す、という一般的なカルーセル実装(Swiper等と同様)の方式を採っています。

**`visibleCount`が2以上、または`peekFraction`が0より大きい(=複数件が同時に見えている)場合のみ、隣接コンテンツ間に32pxの隙間(gap)があります**。暗幕は、コンテナ全体に対する計算値ではなく、各スライド自身が「現在アクティブか否か」を判定して自分の枠内にのみ重ねる方式にしているため、gapを考慮した実際の見切れ具合と暗幕の境界が常に厳密に一致します。暗幕は常時マウントしたまま`opacity`を0(active)⇄1(非active)でアニメーションさせており、スライドの移動(`transform`)と同じ`transitionDurationMs`・同じイージングを使っているため、フェードの開始・完了がスライドの移動の開始・完了と厳密に一致します。

`/gallery/carousel`ページの先頭には、上記4つのpropsのうち代表的な組み合わせを画面上のセレクトボックス(自動再生・スライドサイズ・表示数・見切れ幅・暗幕)から選んでその場でカルーセルに反映できるサンプルを配置しています。5つのセレクトは`flexDirection="column" $md={{flexDirection:"row"}}`(このプロジェクト全体で確立済みのレスポンシブパターン)+`Column`(`src/components/parts/column/Column.tsx`、N個を均等分割する汎用building block)で、モバイルでは縦積み・PC幅では横並びになります。表示数(`visibleCount`)は「1件/2件/3件/4件」から選択でき(既定1件)、見切れ幅は「なし/小(0.15)/大(0.3)」の3択、自動再生は「あり」を選ぶと切替間隔3秒固定になります。表示数はスライドサイズ(基本/フルワイド/1:1固定比率)と独立して選べるため、例えば「1:1固定比率」を選んだ状態で表示数を4件にすると、正方形スライド4枚を同時に並べて確認できます。

**移動(トランジション)が完了するまで、前後ボタン・新規のドラッグ開始を無効化します**(ボタンは薄い色に変わり、無効であることが見た目でもわかります)。これにより「同時に進行中の遷移は常に高々1件」が保証されるため、無限ループ用に実スライドの前後へ複製するスライド(クローン)は、1ステップ分のオーバーシュートに備えるだけの最小限の件数(`Math.min(visibleCount + 1, count)`)で済んでいます。

## 汎用グリッドレイアウト(`LayoutGrid`、`/layout/grid`)

`src/components/layout/grid/LayoutGrid.tsx`は、CSS Gridベースの汎用グリッドコンテナです。`LayoutTable`/`LayoutForm`/`LayoutCarousel`と同じく、表示内容自体(カード等)は持たず、`children`として渡された要素を「列数・セルのアスペクト比が揃ったグリッド」に並べる枠組みだけを担当します。

```tsx
<LayoutGrid columns={{ base: 3, md: 5 }} aspectRatio={3 / 2}>
  {items.map((item) => <Card key={item.id} width="100%" height="100%">{...}</Card>)}
</LayoutGrid>
```

- **`columns?: { base?: number; md?: number }`**(既定`{ base: 2, md: 4 }`): 1行あたりのセル数を、モバイル(768px未満、`base`)とPC(768px以上、`md`)で個別に指定できます。キー名の`md`は、このプロジェクト全体で768pxブレークポイントの上書きに使われているTamaguiの`$md={{...}}`という命名に揃えています(実際のTamaguiレスポンシブprop機構は`styled()`のvariants経由でしか機能せず、任意の数値を取る`grid-template-columns`には使えないため、書き味だけを揃えた独自propです)。
- **`aspectRatio?: number`**(既定`1`): 各セルの横縦比(width/height)。`children`の各要素はこのアスペクト比を持つラッパーで1段包まれるため、中身(Card等)は`width="100%" height="100%"`でラッパーいっぱいに広がるようにしてください。
- 列数はCSS Module(`LayoutGrid.module.css`)側のメディアクエリと、CSS変数(`--layout-grid-mobile-columns`/`--layout-grid-desktop-columns`)経由で橋渡ししています(`grid-template-columns: repeat(N, 1fr)`のNをブレークポイントごとに動的に差し替える必要があり、Tamaguiのレスポンシブpropでは表現できないため)。
- `/layout/grid`ページでは、列数・アスペクト比の組み合わせを4パターン(モバイル2/PC4・1:1、モバイル2/PC3・4:5、モバイル3/PC5・3:2、モバイル4/PC4・3:2)並べて確認できます。

## 汎用「絞り込み」「ソート」コンポーネント(`/data/data-filter-sort`)と`DataTable`/`DataViewer`

`src/components/parts/data/`に、任意のデータ・列構成に動的対応できる絞り込み専用コンポーネント`DataFilter`とソート専用コンポーネント`DataSort`を用意しています。いずれも「UI状態の管理のみ」を担当し、データへの実際の適用は同ファイルでexportしている純粋関数(`applyDataFilter`/`applyDataSort`)を呼び出し側が使う設計です。

- **`DataFilter`**: ボタン押下でPopoverが展開し、絞り込むキーをセレクトボックスで選択→選択したキーの`type`(`range`(数値範囲)/`select`(単一選択)/`checkbox`(複数選択))に応じて条件入力が自動的に切り替わります。既存の`SelectGroupWithLabel`/`CheckboxGroup`/`InputNumber`をそのまま再利用しているため、新規UIはほぼ組んでいません(`checkbox`条件は、上のセレクトで既にフィールド名を表示しているため、ラベル無しの`CheckboxGroup`を使ってラベルの二重表示を避けています)。現状は常に1キー分の条件のみを保持するシンプルな設計です。
- **`DataSort`**: ソートキー・昇順/降順を選ぶ2つのセレクトボックスをテーブル上部に並べるだけの薄いコンポーネントです。
- **`DataTable`(`src/components/parts/data/DataTable.tsx`)**: `DataFilter`+`DataSort`+`LayoutTable`+`DataPagination`を合成した汎用コンポーネントです。`data`/`columns`/`filterFields`/`sortFields`/`onRowClick`/`pageSize`等をすべて呼び出し元からpropsで受け取り、絞り込み・ソート・ページ番号のstateは内部で保持します(`filterFields`/`sortFields`を省略するとその半分のUIごと非表示になります)。行クリック時の詳細表示(ダイアログ等)はこのコンポーネントの責務に含めていません — データソースごとに詳細表示の内容は大きく異なるため、`onRowClick`で行データを親に返すだけにとどめ、呼び出し元が持つ設計にしています。
- **`DataViewer`(`src/components/parts/data/DataViewer.tsx`)**: 上記`DataTable`を使い、商品バリエーション(`shop_product_variants`)向けの列構成・絞込/ソート項目・行クリック時の詳細ダイアログを組み込んだページ専用ラッパーです。`categories`/`colors`/`sizes`/`variants`をpropsで受け取ります。**`/data/data-filter-sort`ページ**(Server ComponentでDB取得→`DataViewer`へpropsで渡す構成)がこの実例です(旧`/shop`ページの内容を引き継いでいます。下記「データベース」参照)。値段は表示直前に`"￥12,000"`形式(桁区切り+円記号)へ変換しており、絞り込み・ソート自体は生の数値のまま正しく動作します。
- **`DataFilter`は入力・選択の内容を「下書き(draft)」stateにのみ反映し、実際に絞り込みを適用するのは「適用」ボタン押下時のみです**(範囲・セレクト・チェックボックスの全条件タイプで共通)。データ件数が多い場合(`/data/data-filter-sort`の384件など)、条件を1文字/1クリック変更するたびに即座に絞り込みを反映すると、そのたびにテーブル全体が再構築され体感できる一時停止が発生していたための対処です。ポップオーバーを適用せずに閉じると編集内容は破棄され、次に開くと最後に適用された状態から編集を再開できます。「クリア」は下書きを経由せず即座に絞り込みを解除します。
- **`DataPagination`(`src/components/parts/data/DataPagination.tsx`)**: `DataTable`にページネーションを追加するための純粋関数`paginateData`+表示コンポーネントです。`DataTable`の`pageSize`prop(既定40件)でページあたりの表示件数を指定でき、ページ数が1以下の場合はUI自体を表示しません。絞り込み・ソートを変更すると自動的に1ページ目に戻ります。ページネーションによって`LayoutTable`が一度に再構築する行数の上限が固定されるため、ソートのようにデータ件数が多いと重くなりがちな操作の体感速度改善にも寄与しています(絞り込みの「適用ボタン」と並ぶ、もう一つの高速化策)。

- **モバイル表示時のレイアウト**: `Form`自体のpaddingはモバイルで`0`、`md`ブレークポイント以上で`$6`に切り替わるレスポンシブ値にしており、テーブル全体が画面幅いっぱいまで使えるようにしています(送信ボタン・注記テキストのみ、画面端に張り付かないよう最小限の`marginHorizontal`をモバイル時に付与)。
- **好きな動物(RadioGroup)もモバイルで折り返し**: `/forms`ページの`RadioGroupWithLabel`と同じ回避策(後述)を適用しています。
- **モバイルのSelectはボトムシートを選択直後に即座に閉じます**(`Sheet.Overlay`のフェードトランジションを外している)。フェード付きのままだと、選択肢をタップしてシートが閉じる数百msの間、画面全体が薄暗いまま残り、選択肢以外の表示が一時的に消えたように見える演出になっていたための対処です。

## タイマー / ポモドーロタイマー(`/components/timer`, `/components/pomodoro`)

`src/components/Timer.tsx`は、`src/lib/stores/timer-store.ts`(`createTimerStore()`で呼び出すたびに独立したインスタンスを返すZustandストア)と、`src/components/parts/timer/`の4部品(`TimerLabel`/`TimerValue`/`TimerSetter`/`TimerTrigger`)を組み合わせた単体のカウントダウンタイマーです(`/components/timer`)。残り秒数が0に到達すると`isRunning`が自動的に`false`に切り替わり、`TimerValue`の表示も非アクティブ色に変わります。

`/components/pomodoro`ページは、この`Timer.tsx`と同じ部品・storeをそのまま使い、`createTimerStore()`を2回呼んで作業用・休憩用の独立したストアインスタンスを持たせています。片方のカウントが0に到達すると、もう片方を設定秒数まで巻き戻して自動的に開始する仕組みになっており、作業→休憩→作業→休憩…という循環を手動操作なしで継続します。一時停止・リセットボタンは、現在「作業」「休憩」どちらの番かに応じて対象のストアを自動的に切り替えます。

## ギャラリー(`Gallery`、`/sample/gallery`)

`src/components/parts/gallery/Gallery.tsx`は、メイン画像+サムネイル一覧のギャラリーコンポーネントです。サムネイル部分は`mode?: "grid" | "carousel"`(既定`"grid"`)propで、既存の汎用レイアウト`LayoutGrid`/`LayoutCarousel`のどちらを使うか切り替えられます。gridモードでは`columns`(既定`{ base: 3, md: 6 }`)、carouselモードでは`visibleCount`(既定`2`)+`peekFraction={0.3}`でそれぞれの表示密度を調整できます(carouselモードのチラ見せは、完全表示中のサムネイルが前後ボタンと重ならないようにするための調整でもあります)。サムネイルをクリックするとメイン画像が切り替わり、選択中のサムネイルには枠線ハイライトが付きます(この選択ロジックはどちらのモードでも共通)。メイン画像は`src/components/parts/gallery/ImageMagnifier.tsx`によりカーソルを合わせると2倍ズームの小窓がカーソルに追従して表示されます。`/sample/gallery`ページでgrid版・carousel版を並べて確認できます。

## アコーディオン(`/sample/accordion`)

Tamagui標準の`Accordion`(`type="single"`=排他/`type="multiple"`=独立というRadix系標準API)を使ったサンプルページです。「アコーディオンA」「アコーディオンB」という2項目を横並びに配置した1つのAccordionグループとして構成しており、画面上部のスイッチで、両方同時に開ける独立モードと、片方を開くともう片方が自動的に閉じる排他モード(開いている項目を再度クリックすれば両方とも閉じられます)を切り替えられます。スイッチのラベル自体が現在のモード(「独立モード(両方同時に開ける)」/「排他モード(片方を開くと片方が閉じる)」)を表示するため、今どちらのモードかが一目でわかります。開閉は[tamagui.dev/ui/accordion](https://tamagui.dev/ui/accordion)公式サンプルに準拠し、`Accordion.HeightAnimator`による高さアニメーション+シェブロンアイコンの回転で表現しています。

## Hero(`src/components/parts/hero/Hero.tsx`、`/sample/hero`)

画像+`children`(コンテンツ)を組み合わせる汎用Heroセクションコンポーネントです。`mode?: "background" | "imageRight" | "imageLeft"`(既定`"background"`)で画像の使い方を3パターン切り替えられます: ①画像をコンポーネント全体の背景にしてコンテンツを重ねる(白/黒の網掛けを`overlayColor`/`overlayOpacity`で調整可能)、②コンテンツ左・画像右の2分割、③コンテンツ右・画像左の2分割。②③では`imageOverlay`prop(任意)で画像側にも別コンテンツを重ねられ、その際は画像側にも①と同じ網掛けが適用されます。モバイル幅ではコンテンツ→画像の縦積みに自動的に切り替わります。コンポーネント自体の上下には区切り線(border)が付いています。`/sample/hero`ページで3パターンとも確認でき、②③では既存のフォーム部品(`InputSimpleText`/`InputPassword`)を組み合わせた簡単なログインフォームを`imageOverlay`に渡す例を実践しています(パネルの背景色・文字色はテーマトークンではなく、その`overlayColor`(白/黒)に対して視認性を確保できる生の色を明示指定しています)。

## インライン編集フィールド(`EditInPlaceField`、`/sample/edit-in-place`)

`src/components/parts/form/input/EditInPlaceField.tsx`は、クリックでその場がテキストボックスに切り替わり編集できる汎用コンポーネントです。`<Input>`または`<TextArea>`を`children`として1つネストすることで、1行入力・複数行入力の両方に対応します。編集は下書き方式(`DataFilter`と同じ考え方)で、「確定」ボタン(Popoverで表示)を押すか、クリックアウトサイド・Escapeキーで編集を終えると`onValueChange`が呼ばれて値が確定します(下書きを破棄する経路はありません)。`InputSuggest`と同じPopoverパターン(`disableFocusScope`)を使っており、Popoverが開いても実際の入力欄からフォーカスが奪われず、クリック直後からそのままタイピングできます。`/sample/edit-in-place`ページでInput版・TextArea版の両方を確認できます。

## カラムレイアウト(`Column`、`/sample/column`)

`src/components/parts/column/Column.tsx`は、複数並べることでPC3カラム/モバイル1カラム(縦積み)のようなカラムレイアウトを構成できる、単一カラム分のシンプルなコンポーネントです。`Hero`の2分割パターン(`width="100%"` + `$md={{flex:1, width:0}}`)を一般化しており、行方向のコンテナ(`flexDirection`の切り替え)は呼び出し側が用意します。`/sample/column`ページでは、3カラム×各カラム3枚(計9枚、ラベルは1-1〜3-3)のカードを配色を交互に切り替えながら表示し、PC幅では3カラムが横に並び、モバイル幅では1カラムずつ縦に積まれる例を確認できます。

## チャートダッシュボード(`/sample/chart`)

`BarChartCard`/`LineChartCard`/`PieChartCard`/`RegionStatRow`(いずれも`src/components/parts/chart/`・`src/components/parts/card/`)に、`shop_monthly_order_summary`ビュー・`shop_monthly_targets`テーブルの実データを接続したダッシュボードです。画面上部の年・月セレクト(共通の1組)で選択した月を基準に、4つのコンポーネントすべてが連動して再計算されます。

- 棒グラフ(受注件数)・折れ線グラフ(売上額)は、選択月を含む過去6ヶ月分の値をバー/ラインの下にラベル(月表示)付きで表示し、該当データが無い月は0として扱います。上部の数値は選択月とウィンドウ先頭月との差分(符号付き、売上は`￥###,###,###`形式)です。
- 円グラフは選択月のカテゴリ別受注件数(トップス/ボトムス/シューズ/バッグ)を表示します。配色パレット(`useChartPalette`)は4→5色に拡張し、スライスが5つになっても色が衝突しないようにしています。
- 目標達成率の行(`RegionStatRow`)は、選択月の売上額と目標額から達成率を算出し、Progressバーが達成率に応じて緑(100%以上)/黄(80%以上)/赤(それ未満)に色分けされます。達成部分(Indicator)は明るい色、未達成部分(Track)は暗い色になっており、達成率に応じた塗りつぶし量が視認できます。
- `shop_orders`のシード時の月別受注件数は、完全な等間隔の伸びにならないよう、右肩上がりの傾向を保ちつつ月ごとにランダムな伸び率(±40%程度)を加えて配分しています(`src/db/seed.ts`)。
- `src/app/(pages)/sample/chart/page.tsx`はServer Componentとして`shop_monthly_order_summary`/`shop_monthly_targets`を全件取得し(`/shop`ページと同じパターン)、Client Component `ChartDashboard.tsx`へpropsで渡してクライアント側で年月ごとの計算を行っています。

## 拡張チャート(`/data/advanced-charts`)

DBに紐づかない、静的サンプルデータだけで完結するチャート/図の詰め合わせページです。`src/components/ui/charts/`配下の以下4コンポーネントを1ページにまとめて確認できます(いずれも本格的な図ライブラリを使わず、手描きSVGで実装しています)。

- `GroupedBarChart` ── 軸・凡例つきのグループ棒グラフ。`groups`(x軸ラベル)と`series`(系列ごとの値配列)を渡すと、グループ内に系列数だけ棒が並びます。
- `MultiLineChart` ── 軸・凡例つき多系列ラインチャート。`logScale`propで対数y軸に切り替えられ、桁数が大きく異なる系列(指数的に伸びる系列など)を同じグラフで比較できます。ページ内では通常軸・対数軸の両方の見え方を並べています。
- `GraphCanvas` ── ノード/エッジのグラフ描画。座標(`x`/`y`)を持つノードはそのまま配置され、持たないノードは自動で円環配置されます。`highlightEdgeIds`(実線・強調色)/`dashedEdgeIds`(破線)/`directed`(矢印)で辺の意味を描き分けられます。経路図・ネットワーク図などに使えます。
- `GanttCanvas` ── 時間軸に沿った横バーのタイムライン(ガントチャート)。`highlight`でクリティカルパス等を強調し、`slack`でタスクを遅らせられる余裕を薄い延長として描画します。

いずれも`useChartPalette`(`src/lib/theme-gradients.ts`)でライト/ダークテーマ用の配色を切り替え、`useHasMounted`でサーバー/クライアントの初回描画差分(hydration mismatch)を避けています。既存の`BarChart`/`LineChart`/`PieChart`と同じ依存構成のため、単純な棒/折れ線/円グラフでは表現しきれない可視化が必要になったときにそのまま拡張できます。

## Tableレイアウトサンプル(`/layout/table`)

`LayoutTable`(`src/components/layout/table/LayoutTable.tsx`)を使い、行数・列数(それぞれ1〜10の数値入力)を指定すると表の行/列が動的に増減するサンプルです。ヘッダーは`column-1, column-2...`、セルの値は`{列番号}-{行番号}`になります。範囲外の値を入力しても1〜10にクランプされてテーブルには反映されますが、入力欄自体は打った値をそのまま表示し続けます(クランプ後の値を入力欄へ書き戻さないことで、2桁の数値を自由に打ち直せるようにしています)。

## Tabsレイアウトサンプル(`/layout/tabs`)

`LayoutTabs`(`src/components/layout/tabs/LayoutTabs.tsx`)に新設した`orientation?: "horizontal" | "vertical"`(既定`"horizontal"`)propで、タブ横配置・縦配置(タブ一覧が左、コンテンツが右)の両方を確認できるサンプルです。タブ一覧の背景は`$color3`(ページ背景と実際に異なる値になる、パステルパレットでは`$color2`だとページ背景と同色になるため)を使い、タブ一覧の帯とコンテンツ領域がはっきり見分けられるようにしています。

タブ一覧・コンテンツの両方に`borderWidth={1}`(色は`$borderColor`)を引いて、ひと続きの角丸パネルとして見えるようにしています。タブ一覧とコンテンツが接する辺(横配置は下端、縦配置は右端)は、二重線・不自然な切れ込みを避けるため、片方だけがその辺の線を描画し(コンテンツ側は該当辺を`borderWidth={0}`にする)、角丸もその接触面の角だけを潰しています(横配置ならタブ一覧の下2つの角・コンテンツの上2つの角、縦配置ならタブ一覧の右2つの角・コンテンツの左2つの角)。

## 階層型メニュー(`HierarchicalMenu`)

サイトメニュー内の`HierarchicalMenu`(`src/components/parts/menu/HierarchicalMenu.tsx`)は、ダミーの固定項目ではなく`(pages)/(sample)`配下の実際のページ階層(Data/Form Parts/Gallery/Layout/Othersの5グループ)を反映した、開閉可能な本物のナビゲーションになっています。現在表示中のページが属するグループは自動的に開いた状態で表示されます。1つのグループを開くと他のグループは自動的に閉じる排他モード(`Accordion type="single" collapsible`)です。

このページ階層データ(`MENU_TREE`)は`src/lib/menu-tree.ts`に切り出されており、`HierarchicalMenu`だけでなくトップページのリンクカード・404ページのリンクカラムからも同じデータを参照しています(詳細は次項)。

各ページ共通の`Breadcrumb`(`src/components/parts/breadcrumb/Breadcrumb.tsx`)には`description?: string`propがあり、渡すとパンくずリストの下にそのページの説明文が表示されます。`(sample)`配下の各サンプルページでは、それぞれのデモ内容に即した説明文を設定しています。パンくずリスト自体も、以前は「Home > ページタイトル」の2階層だけでしたが、`usePathname()`の現在URLが`MENU_TREE`のどのグループに属するかを検索し「Home > グループ名 > ページタイトル」の3階層で中間の階層(Data/Form Parts/Gallery/Layout/Others)も表示するようにしています(グループ自体に対応するページは存在しないためリンクにはせずテキスト表示のみ)。`MENU_TREE`に含まれないパス(ホームページ・404ページ等)では中間階層を省略し、従来通りの2階層のままです。

## トップページ・404ページ

- **トップページ**(`src/app/(pages)/page.tsx`)は`Hero`(`mode="imageRight"`、コンテンツ左・画像右の半々)でタイトルとプロジェクト趣旨を紹介し、その下に`LayoutGrid`(`columns={{base:1, md:3}}`)で`MENU_TREE`の5グループぶんの`Card`(グループ名ヘッダー+各ページへのリンク一覧)を並べています。
- **404ページ**(`src/app/not-found.tsx`)は、Next.js標準の`not-found.tsx`規約(アプリルート直下に置くだけで未マッチの全URLを捕捉し、`AppShell`のchrome(Header/Menu/Footer)にも自動的に包まれます)に従って新規実装しています。「指定のページは存在しません」の見出しの下に、`Column`によるカラムレイアウトで`MENU_TREE`の5グループぶんのリンク一覧を表示します(`src/components/parts/not-found/NotFoundContent.tsx`)。`not-found.tsx`はデフォルトでServer Componentのため、実際のUI(Tamagui使用)は別ファイルの`NotFoundContent`(Client Component)に分離しています。

## カレンダー(`CalendarCard`/`DatePickerWithLabel`、`/form-parts/calendar`)

`src/components/parts/calendar/CalendarCard.tsx`(カレンダーUIで日付を選択→「Select Date」ボタンで決定する2段階のカード)と`src/components/parts/form/DatePickerWithLabel.tsx`(ポップオーバー形式の日付選択、選んだ瞬間に確定)の2種類の日付選択コンポーネントを並べたデモページです。`CalendarCard`は`onConfirm?: (date: string) => void`propを持ち、日付セルをクリックしただけでは確定せず、ボタン押下で初めて`"YYYY-MM-DD"`形式の日付が親へ通知されます(下の`Calendar`本体は`onSelectionChange`propで選択状態を親へ伝える設計に拡張済み)。

`DatePickerWithLabel`のカレンダーポップオーバーは、サイトのライト/ダークモードに関わらず常に白背景・黒文字で表示されます。$color9のようなトークンはアンビエントのサイトテーマに応じて解決先が変わり、ダークモード下では文字色が白背景に対してほぼ不可視になっていたため、ポップオーバー内の色はすべてトークンに頼らずリテラル値(white/black/グレー)で直接指定しています(`<Theme name="light">`でラップしトークン解決先を強制する方式も検討しましたが、Popover.Contentが開閉状態に関わらず常にDOMへマウントされる都合上、SSR/CSR間でアンビエントテーマが食い違うケースがあり、ネストしたTheme境界のクラス名が不一致になってhydrationミスマッチ警告が発生したため採用していません)。またポップオーバーは`placement="top-start"`により、トリガーの上に表示されます。

`/form-parts/calendar`ページ(`page.tsx`)自体に、存在しないprop名`parring`(意図は`padding`)・存在しないtoken名`$border-color`(kebab-case、意図は`$borderColor`)・未使用importの`Card`という3件のタイプミスがあり、`npx tsc --noEmit`でエラーになっていたため修正しています。

## 共通ベーステンプレート

全ページは `src/app/layout.tsx` 経由で `AppShell`(`src/components/layout/AppShell.tsx`)にラップされ、以下の共通UIが適用されます。

- **ヘッダー**: 画面上部にフロート固定(position: fixed)。タイトル「Next.js + Tamagui Templates」+ ライト/ダーク切替ボタンを、PC・モバイルともに横並び・両端揃えで表示します(高さ固定・タイトルは狭幅では省略記号で1行に収まります)。
- **開閉メニュー**: ヘッダー下端〜フッター上端の帯に固定表示されます。PC版はデフォルトで開いた状態(幅400px固定)で、初期表示時からアニメーションなしで開いた状態が表示されます(ユーザー操作での開閉時は250msでスライドします)。閉じると画面左に隠れます。モバイル版はデフォルトで閉じた状態で、開くと画面上部から降りてきます。開閉ボタンはコンテンツ左上とメニュー上部の2箇所にあります。「Counter」は `/counter`、「コンポーネントサンプル 3」は `/copy-theme` への実リンク、残り1件は今後コンポーネントサンプル集ページを追加する予定の仮リンクです。**メニューはコンテンツを押し出さず、コンテンツの上にフロート表示されます**(重なり順は手前から順にヘッダー/フッター → メニュー → コンテンツ)。
- **フッター**: 画面下部にフロート固定(position: fixed、高さ固定)。中央に「github」リンク(このリポジトリ自身、別タブで開きます)。

アイコンには [`lucide-react`](https://lucide.dev/) を使用しています(`@tamagui/lucide-icons` は現時点でTamagui本体のバージョンと噛み合わないため不採用としました)。

## テーマカラー

`tamagui.config.ts`は[quaiz-front](https://github.com/yd-uai-coder/quaiz-front)(このテンプレートを起点に作られたアプリ)と設定を揃えています。`@tamagui/config/v5`の`defaultConfig`をそのまま展開し、`light`/`dark`テーマに以下7つのキーだけを追加している、素のRadixカラースケール(`gray`/`blue`/`red`/`yellow`/`green`/`orange`/`pink`/`purple`/`teal`/`neutral`/`accent`、いずれも個別のパステル化はしていない)ベースのシンプルな構成です。

| テーマキー | 用途 | 参照元 |
| --- | --- | --- |
| `background` | ライト/ダークそれぞれの背景色(固定の16進値) | Tamaguiの`$background`全体 |
| `listItemHover` | リスト項目のホバー背景 | `src/components/ui/layout-blocks/LayoutList.tsx` |
| `styledHeaderColor` / `styledHeaderShadow` | 装飾見出しの文字色・影 | `src/components/ui/primitives/StyledHeader.tsx` |
| `cardShadow` | カードの影 | `src/components/ui/primitives/StyledCard.tsx` |
| `headerFooterGradient` | ヘッダー/フッターの背景グラデーション | `src/components/layout/Header.tsx` / `Footer.tsx`(`backgroundImage="$headerFooterGradient"`として直接指定、生CSSの注入は不要) |
| `logoGlow` | ロゴ画像への`filter: drop-shadow(...)`用(現状未使用) | (将来、Tamaguiの`filter`propがWeb未実装な問題への回避策として使う想定。詳細は`CLAUDE.md`の「過去のセッションで見つかったハマりどころ」参照) |

`$borderColor`はTamagui標準(`@tamagui/config/v5`)のstep4のままで、独自のコントラスト調整は行っていません(`$background`との明度差が小さく、境界線が視認しにくい箇所があります)。個別に濃い境界線が欲しい場合は、コンポーネント側で`borderColor="$color7"`のように明示指定してください(`src/components/ui/primitives/RadioGroupItem.tsx`等が実例)。

チャート機能(`/data/chart`のPieChart・`/form-parts/calendar`のCalendarCard・LineChartCard)が使うグラデーション/配色はquaiz-front側に対応物が無いため、`tamagui.config.ts`のテーマトークンではなく`src/lib/theme-gradients.ts`が`@tamagui/colors`から直接読み込む生のRadixカラー(`blue`/`blueDark`/`green`/`greenDark`/`orange`/`orangeDark`)を使っています。

### サイズトークン・カラーパレット確認ページ(`/test-sample`)

`src/app/(pages)/test-sample/page.tsx`は、Tamaguiの`Button`コンポーネントを使い、サイズトークン(`$1`〜`$10`)ごとの文字サイズと、選択可能な全カラーテーマ(`gray`/`blue`/`red`/`yellow`/`green`/`orange`/`pink`/`purple`/`teal`/`neutral`/このプロジェクト独自の`accent`の11種)の配色を一覧確認できる開発用ページです。テーマごとに1行、その中に`$1`〜`$10`のボタンを並べ、ボタンのラベル自体にサイズトークン名を表示することでそのサイズの実際の文字サイズを、行を縦に見比べることでテーマごとの配色を確認できます。他の`(pages)/(sample)`配下のデモページ群とは別に、ナビゲーションメニュー(`MENU_TREE`)には含めていません。

## 汎用カスタムフック(`src/lib/hooks/`)

複数コンポーネントで似た形の状態管理ロジック(タイマーのtick、カレンダーの月移動、フィルタ/ソート/ページネーション、ドラフト編集、連動セレクト、直近Nウィンドウ抽出、無限ループカルーセルの状態機械)が個別に実装されていたため、`src/lib/hooks/`へ切り出しています。フック名・ファイル名は「どのコンポーネントのために作ったか」ではなく「何を処理するか」を基準に付けており、対象コンポーネント以外からも使い回せることを前提にしています。一方、コンポーネント固有のデータ型に依存する計算(例: `ChartDashboard`の売上・受注件数の集計)は無理にフック化せず、各コンポーネント側に残しています。

- **`useInterval(callback, delayMs)`**: 一定間隔でコールバックを実行する汎用インターバルフック(`delayMs`に`null`を渡すと停止)。`src/components/Timer.tsx`と`src/components/parts/timer/TimerPomodoro.tsx`は、どちらも独自に`setInterval`/`clearInterval`のtickロジックを実装していました(`TimerPomodoro.tsx`はローカルの`useTimerTick`として一部切り出し済みでしたが、`Timer.tsx`は同じロジックを再実装していました)。両者ともこのフックの上に構築するよう統一しています。
- **`useCalendarGrid(initialYear, initialMonth)`**: 年月から週単位のカレンダー行列(前後月の日付を含む)を計算し、前月/次月への移動(`goPrev`/`goNext`)・表示中の年月を直接差し替える`setView`を提供します。「どの日付が選択されているか」という関心事は持たず、`{ year, month }`から純粋にグリッドを計算するAPIです。`src/components/parts/calendar/Calendar.tsx`と`src/components/parts/form/DatePickerWithLabel.tsx`はほぼ同一の`getMonthMatrix`/月送りロジックをそれぞれ個別に実装していたため、このフックへ統合しています(`DatePickerWithLabel`側は文字列値から年月をパースして本フックに渡すラッパー)。
- **`useFilterSortPagination(data, { filterValue, sortValue, applyFilter, applySort, pageSize })`**: フィルタ→ソート→ページ切り出しの汎用パイプライン。フィルタ/ソートの値自体は呼び出し側が所有し(`DataFilter`/`DataSort`のonChangeから変化する`filterValue`/`sortValue`)、値が変わった際は`resetPage()`でページを1に戻します。`src/components/parts/data/DataTable.tsx`のフィルタ→ソート→ページネーション処理をこのフックに委譲しています。
- **`useDraftValue(value, onChange)`**: 編集中のドラフト値を保持し、確定(`commit`)操作で初めて外部の`onChange`へ反映する状態パターン。ポップオーバーの「適用」ボタンを挟む編集UI全般に使える設計です。`src/components/parts/data/DataFilter.tsx`の「下書き編集→適用ボタンで確定」ロジックをこのフックに置き換えています。
- **`useCascadingSelection(initialParent, initialChild, getChildOptions, fallbackChild)`**: 親の選択肢(例: 年)が変わったとき、子の選択肢(例: 月)が新しい親のもとで無効ならフォールバック値へ自動リセットする「連動セレクト」の汎用フック。`src/app/(pages)/(sample)/data/chart/ChartDashboard.tsx`の年→月カスケード選択ロジックに使用しています。
- **`useTrailingWindow(end, size)`**: 基準の年月から遡って直近`size`件分の年月配列(先頭が最も古い月)を作る、年月ベースの直近Nウィンドウ抽出フック。`ChartDashboard.tsx`の「選択月を含む過去6ヶ月分」の算出に使用しています。
- **`useInfiniteCarousel({ count, visibleCount, intervalSeconds, transitionDurationMs })`**: ドラッグ操作・自動再生タイマー・トランジションロック・クローンバッファでのインデックス補正を伴う「無限ループカルーセル」の状態管理。スライドの中身(表示用配列の構築・レンダリング)は呼び出し側の責務とし、`index`・ドラッグ量・各種イベントハンドラのみを返します。`src/components/layout/carousel/LayoutCarousel.tsx`の状態管理ロジック(このプロジェクトで最も複雑な状態機械)をこのフックへ切り出しています。
- **`useShuffle(items)`**(`/others/shuffle`): Fisher-Yatesアルゴリズムで配列をシャッフルする汎用フック。`{ items, reshuffle }`を返し、`reshuffle()`を呼ぶと任意のタイミングで再シャッフルできます。`useHasMounted()`(後述)がtrueに切り替わったタイミングで自動的に1回シャッフルする設計のため、このフックを呼ぶコンポーネントがマウントされる(画面が読み込まれる)たびに並び順が変わります。サーバー描画・初回クライアント描画では渡された`items`をそのまま返すため、`Math.random()`に起因するhydrationミスマッチは起きません。

既存の`src/lib/hooks/useHasMounted.ts`(`ThemeToggleButton`/`CalendarCard`/`useShuffle`が使用)、`src/components/parts/form/validation/shared.tsx`の`useRuleCheck`(12種のバリデーションルールデモページが共通利用)も同じ「繰り返し登場する状態パターンをフック化する」方針の先行例です。

### シャッフルサンプル(`/others/shuffle`)

`useShuffle`フックのデモページです。`sample_1`〜`sample_4`の4要素を`LayoutGrid`(既定の`{ base: 2, md: 4 }`)で表示するブロックを2つ並べています。「ボタンでシャッフル」ブロックは`reshuffle()`をボタンの`onPress`に割り当てたもので、押すたびに並び順が変わります。「画面読み込みのたびにシャッフル」ブロックはボタンを持たず、`useShuffle`自身のマウント時自動シャッフルだけで、ページを開き直すたびに並び順が変わることを示しています。2ブロックは`useShuffle`をそれぞれ独立に呼び出しているため、片方の操作(ボタン押下)がもう片方に影響することはありません。

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

### DB依存ページの静的JSONスナップショット化

`/data/chart`・`/data/data-filter-sort`・`/form-parts/suggest`の3ページは、以前はDBを毎回(またはISRで定期的に)クエリしていましたが、現在は`src/data/*.json`(`keywords.json`・`shop-categories.json`・`shop-colors.json`・`shop-sizes.json`・`shop-product-variants.json`・`shop-monthly-order-summary.json`・`shop-monthly-targets.json`)を`import`する素の静的コンポーネントになっています。これにより**Vercelデプロイ時にTurso等の本番DB設定が一切不要**になります(以前はVercel上に`sqlite.db`が存在せず、Turso未セットアップ状態でビルド自体が失敗していました)。

- `npm run db:export-json`(`src/db/export-json.ts`)で、現在のDB(ローカル`file:sqlite.db`または`TURSO_DATABASE_URL`で指定した接続先)から上記7テーブル/ビューを取得し、`src/data/`配下のJSONへ書き出せます。`db:seed`でシードデータを入れ直した後などに再実行し、生成されたJSONをコミットしてください。
- DB/Turso(`src/db/`一式)自体は削除しておらず、`db:seed`のデータ供給元、および将来これらのページ以外でDBを使った動的な機能を追加する場合の基盤として残しています。上記3ページ自身は実行時に`@/db`へ依存していません。

### 商品DB(`shop_*`テーブル)と`/data/data-filter-sort`ページ

ユーザー提供のスプレッドシート「DB」シートに沿って追加した、商品カタログ相当のテーブル群です。**SQLiteには真のスキーマ概念が無い**ため、スプレッドシート上の「shop」スキーマ区分は`shop_`というテーブル名プレフィックスで表現しています(既存の`users`/`categories`/`keywords`とは完全に独立した名前空間)。

- `shop_categories`(4件: tops/bottoms/shoes/bag)・`shop_colors`(6件: red/blue/green/white/black/gray)・`shop_sizes`(4件: S/M/L/XL) — いずれも`id`/`name`/`created_at`のみのマスタテーブル。
- `shop_products`(16件、カテゴリごとに4件) — `name`/`description`/`price`(2000〜10000円、100円単位)/`category_id`(FK→`shop_categories.id`)/`created_at`/`updated_at`(NULL許可)。
- `shop_product_variants` — `shop_products` × `shop_colors` × `shop_sizes` の全組み合わせ(カーティジアン積)+ カテゴリ名を1行にまとめたVIEW(384件 = 16×6×4)。列名はユーザー指定の表示名(商品名/説明/値段/カテゴリ/色/サイズ)をそのままSQLのカラムエイリアスとして使っています。`src/db/schema.ts`で`sqliteView(name, columns).as(sql\`...\`)`という生SQL指定の書き方を使っています(クエリビルダー経由の`.select({日本語キー: column})`だと、drizzle-kitが生成する`CREATE VIEW`文にエイリアスが反映されず同名列が衝突する不具合を実際に確認したため)。`ShopCategory`/`ShopColor`/`ShopSize`/`ShopProduct`/`ShopProductVariant`という型を`typeof shopXxx.$inferSelect`で導出してexportしており(`sqliteView`もDrizzleの`View`クラスが`$inferSelect`を持つため導出可能)、呼び出し側(`DataViewer.tsx`等)が同じ形の型を手書きで複製する必要がありません。
- `/data/data-filter-sort`ページ(`src/app/(pages)/(sample)/data/data-filter-sort/page.tsx`)は`shop_product_variants`(384件)を「商品名・値段・カテゴリ・色・サイズ」の5列で一覧表示し、絞り込み(値段=range・カテゴリ=select・色/サイズ=checkbox)・ソート(商品名/値段/カテゴリ)・ページネーション(1ページ40件)も備えています。Server ComponentでDB取得→Client Component `DataViewer.tsx`(商品バリエーション向けのページ専用ラッパー)で表示する構成で、テーブル描画自体は上記の汎用`DataTable`(`DataFilter`+`DataSort`+`DataPagination`+`LayoutTable`を合成)に委ねています。カテゴリ/色/サイズの選択肢は`shop_categories`/`shop_colors`/`shop_sizes`から生成しています。
  - `LayoutTable`に`bodyMaxHeight`(ヘッダー行を常に表示したままレコード部分だけを縦スクロール、ヘッダー・ボディは横スクロール時に連動)・`minWidth`(テーブル幅が画面より狭い場合に横スクロールを有効化)・`onRowClick`(行クリックで任意のコールバックを実行、カーソル・ホバー/プレス色の視覚フィードバック付き)・`columns`の各列に指定できる`render`(値を表示専用に整形するコールバック、未指定時は文字列/数値をそのまま表示)という後方互換プロップを追加しました。いずれも未指定時は従来通りの見た目・挙動のままなので、既存の呼び出し元(`FormTable.tsx`、`/layout`ページ、`/data/data-filter-sort`)には影響しません。
  - `LayoutTable`・`DataTable`はどちらも`React.memo`でラップしています。`/data/data-filter-sort`ページの行クリックで開くモーダル(下記)の開閉は、それを開閉するstateがテーブル本体のprops(`data`/`columns`/`filterFields`/`sortFields`/`onRowClick`)と無関係なため、開閉のたびに384行ぶんのテーブル要素を再構築していた既存の遅延が解消されています(値段列も`render`で表示時に整形する方式にしたことで、行データ自体を毎レンダー複製する必要がなくなりました)。
  - `/data/data-filter-sort`ページでは行をクリックすると、画像(ダミー画像URL固定表示、DBに画像列は無いため)・商品名・説明・値段・色・サイズを表示するモーダル(`DataViewer.tsx`内の`VariantDetailDialog`)が開きます。確認/否定を問う操作ではなく単なる情報表示のため、既存の`AlertDialog`ではなく素の`Dialog`(`tamagui`が`@tamagui/dialog`をそのまま`export`しているため利用可能)を使っています。詳細ダイアログの中身は`DataTable`の責務に含めず、`DataViewer.tsx`が自前で持っています。
- `shop_orders`(108,000件、2023年1月〜2026年7月に線形の成長トレンドで配分) — `product_id`(FK→`shop_products.id`)/`order_date`("YYYY-MM-DD"文字列)/`created_at`(スプレッドシート仕様によりTEXT)/`updated_at`(NULL許可)を持つ受注テーブルです。`shop_monthly_targets`(43件、`(year, month)`にUNIQUE制約付き) — 年・月ごとの売上目標(`target`)で、`target`は対応月の実績売上の70%〜120%になるようシーディング時に計算しています。両テーブルとも`id`列の有無・`created_at`の型がスプレッドシート仕様に忠実(既存の`commonColumns()`/`shopMasterColumns()`とは異なる設計)です。
- `shop_monthly_order_summary` — `shop_orders`を月ごとに集計するVIEW(年月/受注件数/売上額/トップス/ボトムス/シューズ/バッグの件数)。カテゴリ判定は`category_id`のリテラル値ではなく`shop_categories.name`との比較で行っています(`shop_categories`/`shop_products`の`id`はAUTOINCREMENTのため再シーディングのたびに値がずれるため)。UIページは無く、DB層のみの実装です。

## Vercelへのデプロイ

このアプリは[Vercel](https://vercel.com/)へのデプロイを想定しています。全ページ、DBやその他の外部サービスへの依存が無い**SSG(静的生成)**です。DBを参照していた`/data/chart`・`/data/data-filter-sort`・`/form-parts/suggest`の3ページも、上記の通り`src/data/`の静的JSONスナップショットを参照する構成に変更したため、ビルド時に他ページと同様プリレンダリングされます(CSR専用のページはありません。いずれも静的シェルをプリレンダリングした上でクライアント側の操作に対応します)。

そのため、デプロイに特別な準備は不要です。GitHubリポジトリをVercelに接続すれば、標準のNext.js検出で`npm run build`が実行され、そのままデプロイできます(`vercel.json`も不要)。

DB/Tursoは実行時のデプロイ要件ではありませんが、`src/db/`一式は残しているため、将来DBを使った動的な機能を追加したい場合は「データベース」節を参照してください(Turso等のリモートDBを使う場合は`TURSO_DATABASE_URL`・`TURSO_AUTH_TOKEN`をVercelのEnvironment Variablesに登録します)。

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
src/app/(pages)/(sample)/  デモページ本体(data/form-parts/gallery/layout/othersの5グループ、MENU_TREEと対応)
src/app/(pages)/(sample)/others/protected-demo/page.tsx  認証ガード(RequireAuth/GuardedLink/LoginRequiredDialog)のデモページ

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
