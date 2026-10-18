import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import { GoogleLinkDialog } from "../GoogleLinkDialog";

function renderDialog(error: string | null = null, texts: { description?: string; submitLabel?: string } = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <GoogleLinkDialog open error={error} submitting={false} onSubmit={onSubmit} onCancel={onCancel} {...texts} />
    </TamaguiProvider>,
  );
  return { onSubmit, onCancel };
}

describe("GoogleLinkDialog", () => {
  it("既存のアカウントがあることと、パスワードで連携することを伝える", () => {
    renderDialog();

    expect(
      screen.getByText(/このメールアドレスのアカウントがあります。パスワードを入れると、Google アカウントと連携します。/),
    ).toBeInTheDocument();
  });

  it("パスワードが空のうちは送れず、入れると onSubmit に渡す", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    // Tamagui の Dialog は jsdom ではロールのクエリで「隠れている」扱いになるため、aria-label で取る
    const submit = screen.getByLabelText("連携してログイン");
    // Tamagui の Button は disabled を aria-disabled で表す
    expect(submit).toHaveAttribute("aria-disabled", "true");

    await user.type(screen.getByLabelText("このアカウントのパスワード"), "S3cret-pass");
    await user.click(submit);
    expect(onSubmit).toHaveBeenCalledWith("S3cret-pass");
  });

  it("断られた理由を出し、キャンセルで onCancel を呼ぶ", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog("メールアドレスまたはパスワードが正しくありません");

    expect(screen.getByText("メールアドレスまたはパスワードが正しくありません")).toBeInTheDocument();
    await user.click(screen.getByLabelText("キャンセル"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("文とボタンの文言を差し替えられる(マイページの連携)", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog(null, { description: "今のパスワードで確かめます。", submitLabel: "連携する" });

    expect(screen.getByText("今のパスワードで確かめます。")).toBeInTheDocument();
    expect(screen.queryByLabelText("連携してログイン")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("このアカウントのパスワード"), "S3cret-pass");
    await user.click(screen.getByLabelText("連携する"));
    expect(onSubmit).toHaveBeenCalledWith("S3cret-pass");
  });
});
