// devex-api側はE2E_FAKE_LLM=true(docker-compose.e2e.yml、playwright.config.tsのwebServer)で
// 起動しており、app/ai/llm/fake.pyのE2eFakeLLMが応答する。ヒアリング完了はユーザー発話
// 2回目で確定する設計(_TURNS_UNTIL_SUFFICIENT)のため、このテストも2回発話する。
import { expect, test } from "@playwright/test";

function uniqueEmail(prefix: string): string {
  // docker composeのPostgresボリュームは実行間で永続化されるため、再実行のたびに
  // 一意のメールアドレスを使う(UserAlreadyExistsErrorによる登録失敗を避ける)。
  return `${prefix}-${Date.now()}@example.com`;
}

test("ログイン→プロジェクト作成→チャットヒアリング→設計書生成→ダウンロードの一連フロー", async ({
  page,
}) => {
  const email = uniqueEmail("e2e-flow");
  const password = "S3cret-pass";

  // 1. 登録
  await page.goto("/register");
  await page.getByLabel("氏名").fill("E2E Tester");
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード", { exact: true }).fill(password);
  await page.getByRole("button", { name: "登録する" }).click();
  await expect(page).toHaveURL(/\/login/);

  // 2. ログイン
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード", { exact: true }).fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // 3. 新規プロジェクト作成(初期ヒアリング入力)
  await page.getByRole("link", { name: "新規プロジェクトを作成" }).click();
  await expect(page).toHaveURL(/\/projects\/new/);
  await page.getByLabel("システム概要").fill("在庫管理システムを作りたい");
  await page.getByLabel("実現したいこと").fill("在庫数をリアルタイムに可視化したい");
  await page.getByRole("button", { name: "ヒアリングを始める" }).click();
  await expect(page).toHaveURL(/\/projects\/[^/]+\/chat/);

  // 4. チャットヒアリング(2ターンでヒアリング完了と判定される、fake.py参照)
  const messageBox = page.getByPlaceholder("メッセージを入力");
  await expect(messageBox).toBeVisible();

  await messageBox.fill("利用者は倉庫の担当者を想定しています");
  await page.getByRole("button", { name: "送信" }).click();
  // オープニング発話と通常のチャット返信が同じ固定文字列(E2eFakeLLM._reply_for、
  // Phase-4-4.md「実機検証で発見した不具合」参照)のため、strict mode違反を避けるべく.first()を使う。
  await expect(page.getByText("E2E Fake", { exact: false }).first()).toBeVisible();

  await messageBox.fill("特に技術的な制約はありません");
  await page.getByRole("button", { name: "送信" }).click();

  // 5. ヒアリング完了バナーの承認 → 生成トリガー
  const approveButton = page.getByRole("button", { name: "この内容で設計書を生成する" });
  await expect(approveButton).toBeVisible();
  await approveButton.click();

  // 6. 生成完了をポーリングで検知し、ドキュメントプレビュー画面へ自動遷移する
  //    (useGenerationPolling、既定5秒間隔。E2eFakeLLMは実APIを呼ばないため数秒で完了する)。
  await expect(page).toHaveURL(/\/projects\/[^/]+\/documents/, { timeout: 30 * 1000 });

  // 7. 4種のドキュメントタブがすべて生成され、E2E Fake由来の内容が表示されていることを確認する
  for (const label of ["要件定義", "外部設計", "内部設計", "実装計画"]) {
    await page.getByRole("tab", { name: label }).click();
    await expect(page.getByText("E2E Fake", { exact: false })).toBeVisible();
  }

  // 8. ダウンロード(.md)
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "ダウンロード(.md)" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("implementation_plan.md");
});

test("ドキュメントプレビュー画面から再生成すると、再度生成完了まで待って表示を更新する", async ({
  page,
}) => {
  const email = uniqueEmail("e2e-regenerate");
  const password = "S3cret-pass";

  await page.goto("/register");
  await page.getByLabel("氏名").fill("E2E Regenerator");
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード", { exact: true }).fill(password);
  await page.getByRole("button", { name: "登録する" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード", { exact: true }).fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "新規プロジェクトを作成" }).click();
  await page.getByLabel("システム概要").fill("勤怠管理システムを作りたい");
  await page.getByLabel("実現したいこと").fill("打刻を簡略化したい");
  await page.getByRole("button", { name: "ヒアリングを始める" }).click();

  const messageBox = page.getByPlaceholder("メッセージを入力");
  await messageBox.fill("利用者は正社員とアルバイトの両方です");
  await page.getByRole("button", { name: "送信" }).click();
  await messageBox.fill("特にありません");
  await page.getByRole("button", { name: "送信" }).click();
  await page.getByRole("button", { name: "この内容で設計書を生成する" }).click();
  await expect(page).toHaveURL(/\/projects\/[^/]+\/documents/, { timeout: 30 * 1000 });

  // 再生成(revisingへの遷移を経由し、完了後に同じドキュメント画面へポーリングで戻ってくる)
  await page.getByRole("button", { name: "再生成する" }).click();
  await expect(page.getByText("再生成しています")).toBeVisible();
  await expect(page.getByText("再生成しています")).toBeHidden({ timeout: 30 * 1000 });
  await expect(page.getByRole("tab", { name: "要件定義" })).toBeVisible();
});
