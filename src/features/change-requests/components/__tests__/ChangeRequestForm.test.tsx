// SUT: ChangeRequestForm(CR の作成・編集のフォーム)
// ドライバ: Testing Library(入力・クリック)
// スタブ不要 ── 部品は props の関数を呼ぶだけで外部を呼ばないため(onSubmit などは vi.fn で受ける)
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import { ChangeRequestForm } from "../ChangeRequestForm";
import { emptyForm } from "../../changeRequestOps";
import type { BaselineRequirementRead } from "@/features/baselines/api/types";

const REQUIREMENTS: BaselineRequirementRead[] = [
  { id: "FR-001", kind: "FR", priority: "Must", category: "", text: "ログインできる" },
  { id: "FR-005", kind: "FR", priority: "Must", category: "", text: "3件まで添付できる" },
];

function renderForm(props: Partial<Parameters<typeof ChangeRequestForm>[0]> = {}) {
  const onSubmit = vi.fn();
  render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <ChangeRequestForm
        initial={emptyForm(2)}
        requirements={REQUIREMENTS}
        submitting={false}
        submitLabel="下書きで作る"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        {...props}
      />
    </TamaguiProvider>,
  );
  return { onSubmit };
}

describe("ChangeRequestForm", () => {
  it("足りない項目があれば送らずに知らせる", async () => {
    const { onSubmit } = renderForm();

    await userEvent.click(screen.getByRole("button", { name: "下書きで作る" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("タイトルを入れてください");
  });

  it("要件を選んで対象に足し、種類と案を入れて送る", async () => {
    const { onSubmit } = renderForm();

    await userEvent.type(screen.getByLabelText("タイトル"), "上限を5件に");
    await userEvent.type(screen.getByLabelText("内容"), "参考資料の上限を変える");
    await userEvent.selectOptions(screen.getByLabelText("足す要件"), "FR-005");
    await userEvent.click(screen.getByRole("button", { name: "対象に足す" }));
    await userEvent.type(screen.getByLabelText("FR-005 の変更後の案"), "5件まで添付できる");
    await userEvent.click(screen.getByRole("button", { name: "下書きで作る" }));

    expect(screen.getByText("3件まで添付できる")).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "上限を5件に",
        baseline_number: 2,
        targets: [{ requirement_id: "FR-005", kind: "content", proposed_text: "5件まで添付できる" }],
      }),
    );
  });

  it("削除にすると案の欄を出さず、選んだ要件は足す候補から消える", async () => {
    renderForm();

    await userEvent.selectOptions(screen.getByLabelText("足す要件"), "FR-001");
    await userEvent.click(screen.getByRole("button", { name: "対象に足す" }));
    await userEvent.selectOptions(screen.getByLabelText("FR-001 の変更の種類"), "delete");

    expect(screen.queryByLabelText("FR-001 の変更後の案")).not.toBeInTheDocument();
    expect(screen.getByText("(削除)")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /FR-001/ })).not.toBeInTheDocument();
  });

  it("基準の束の欄は出さない(作成では遷移元の束に固定、編集では変えない)", () => {
    renderForm({ submitLabel: "直す" });

    expect(screen.queryByLabelText("基準の合意済みの版")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "直す" })).toBeInTheDocument();
  });
});
