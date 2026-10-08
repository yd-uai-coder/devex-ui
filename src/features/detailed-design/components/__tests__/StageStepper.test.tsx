import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import { DETAILED_ONLY_NOTICE, StageStepper } from "../StageStepper";
import { makeStages } from "../../test-utils/stageFixtures";

describe("StageStepper", () => {
  it("段階1〜8を状態つきで並べ、選んでいる段階を示す", () => {
    render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <StageStepper
          stages={makeStages({
            1: { state: "regenerated" },
            2: { state: "outdated" },
          })}
          selectedStage={2}
          onSelect={vi.fn()}
        />
      </TamaguiProvider>,
    );

    expect(screen.getAllByRole("button")).toHaveLength(8);
    expect(
      // 作り直した段階
      screen.getByRole("button", { name: "段階1 機能一覧(再生成済(未承認))" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "段階2 データフロー(古い)" }),
    ).toHaveAttribute("aria-current", "step");
  });

  it("段階を押すとonSelectを呼ぶ", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <StageStepper
          stages={makeStages()}
          selectedStage={1}
          onSelect={onSelect}
        />
      </TamaguiProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "段階3 データモデル(未着手)" }),
    );

    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it("簡易モードは段階1〜7を使えない行として前に並べ、押しても選ばない", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const stages = makeStages({
      8: { mode: "simple", is_open: true, missing_inputs: [] },
    }).slice(7);
    render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <StageStepper stages={stages} selectedStage={8} onSelect={onSelect} />
      </TamaguiProvider>,
    );

    expect(screen.getByText(DETAILED_ONLY_NOTICE)).toBeInTheDocument();
    const disabled = screen.getByLabelText("段階1 機能一覧(詳細設計モードのみ・使用不可)");
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByText("詳細設計モードのみ")).toHaveLength(7);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    await user.click(disabled);
    expect(onSelect).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "段階8 実装手順書(未着手)" }));
    expect(onSelect).toHaveBeenCalledWith(8);
  });
});
