# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: zz-switch-check.spec.ts >> project switch
- Location: e2e/zz-switch-check.spec.ts:3:5

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('tab', { name: '内部設計' })
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByRole('tab', { name: '内部設計' }) with timeout 5000ms
  - waiting for getByRole('tab', { name: '内部設計' })
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e3]:
    - generic [ref=f2e4]:
      - button "メニューを開く" [ref=f2e6] [cursor=pointer]
      - heading "Devex" [level=3] [ref=f2e8]
      - button "ダークモードに切り替え" [ref=f2e10] [cursor=pointer]
    - generic [ref=f2e13]:
      - button "メニューを開く" [ref=f2e16] [cursor=pointer]
      - heading [level=1] [ref=f2e20]:
        - button "Devex" [ref=f2e21] [cursor=pointer]
    - generic [ref=f2e27]:
      - generic [ref=f2e28]:
        - heading "ドキュメントプレビュー" [level=2] [ref=f2e29]
        - generic [ref=f2e30]:
          - link "チャットに戻る" [ref=f2e31] [cursor=pointer]:
            - /url: /projects/71cba619-e305-4912-8eba-2578abad3cf5/chat
          - link "詳細設計へ進む →" [ref=f2e32] [cursor=pointer]:
            - /url: /projects/71cba619-e305-4912-8eba-2578abad3cf5/detailed-design
          - button "再生成する" [ref=f2e34] [cursor=pointer]
      - generic [ref=f2e36]:
        - tablist [ref=f2e37]:
          - tab "要件定義" [selected] [ref=f2e39] [cursor=pointer]
          - tab "外部設計" [ref=f2e43] [cursor=pointer]
          - tab "内部設計" [ref=f2e47] [cursor=pointer]
          - tab "実装計画" [ref=f2e51] [cursor=pointer]
        - tabpanel "要件定義" [ref=f2e53]:
          - generic [ref=f2e54]:
            - generic [ref=f2e55]:
              - button "クリップボードにコピー" [ref=f2e57] [cursor=pointer]
              - button "ダウンロード(.md)" [ref=f2e60] [cursor=pointer]
            - button "バージョン履歴" [ref=f2e64] [cursor=pointer]
            - generic [ref=f2e66]:
              - heading "要件定義書(E2E Fake)" [level=1] [ref=f2e67]
              - paragraph [ref=f2e68]: これはE2Eテスト用に生成されたダミーの要件定義書です。
    - link "github" [ref=f2e71] [cursor=pointer]:
      - /url: https://github.com/yd-uai-coder/next-tamagui-templates
  - button "Open Next.js Dev Tools" [ref=f2e77] [cursor=pointer]
  - alert [ref=f2e81]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { completeHearing, createProject, registerAndLogin } from "./helpers";
  3  | test("project switch", async ({ page }) => {
  4  |   // ページを読み直さずに(クライアント側の遷移で)ダッシュボードへ戻る。読み直すとストアが初期化され、不具合が再現しない
  5  |   const goDashboard = async () => {
  6  |     await page.evaluate(() => (window as unknown as { next: { router: { push: (h: string) => void } } }).next.router.push("/dashboard"));
  7  |     await expect(page).toHaveURL(/\/dashboard/);
  8  |   };
  9  |   test.setTimeout(180000);
  10 |   await registerAndLogin(page, "switch-check");
  11 |   await createProject(page, "simple", { overview: "在庫アプリ", goal: "a" });
  12 |   await completeHearing(page, ["a", "b", "c"]);
  13 |   const simpleUrl = page.url();
  14 |   await page.goto("/dashboard");
  15 |   await createProject(page, "detailed", { overview: "予約アプリ", goal: "b" });
  16 |   await completeHearing(page, ["a", "b", "c"]);
  17 |   const detailedUrl = page.url();
  18 |   // 簡易 → ダッシュボード → 詳細
  19 |   await page.goto(simpleUrl);
  20 |   await expect(page.getByRole("tab", { name: "実装計画" })).toBeVisible();
  21 |   await goDashboard();
  22 |   await expect(page.getByText("簡易", { exact: true })).toBeVisible();
  23 |   await expect(page.getByText("詳細", { exact: true })).toBeVisible();
  24 |   await page.getByRole("link", { name: /予約アプリ/ }).first().click();
  25 |   await expect(page).toHaveURL(detailedUrl);
  26 |   await expect(page.getByRole("tab", { name: "外部設計" })).toBeVisible();
> 27 |   await expect(page.getByRole("tab", { name: "内部設計" })).toHaveCount(0);
     |                                                         ^ Error: expect(locator).toHaveCount(expected) failed
  28 |   await expect(page.getByRole("tab", { name: "実装計画" })).toHaveCount(0);
  29 |   // 詳細 → ダッシュボード → 簡易
  30 |   await goDashboard();
  31 |   await page.getByRole("link", { name: /在庫アプリ/ }).first().click();
  32 |   await expect(page).toHaveURL(simpleUrl);
  33 |   await expect(page.getByRole("tab", { name: "内部設計" })).toBeVisible();
  34 |   await expect(page.getByRole("tab", { name: "実装計画" })).toBeVisible();
  35 |   console.log("SWITCH OK");
  36 | });
  37 | 
```