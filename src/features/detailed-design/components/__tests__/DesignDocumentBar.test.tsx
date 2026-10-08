import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "@/tamagui.config";
import {
  availableDownloads,
  DesignDocumentBar,
  DOCUMENT_NOTICE,
  unapprovedStages,
} from "../DesignDocumentBar";
import * as download from "@/lib/api/download";
import { makeStages } from "../../test-utils/stageFixtures";
import type { DesignStageRead } from "@/features/detailed-design/api/types";

// SUT: DesignDocumentBar・unapprovedStages / ドライバ: render と操作 /
// スタブ: fetch(サーバーの代わり)と saveFile(ブラウザの保存の代わり)。

const DOCUMENT_BUTTON = "詳細設計書・実装計画をダウンロード(.zip)";
const PROCEDURE_BUTTON = "実装手順書をダウンロード(.zip)";

function renderBar(stages: DesignStageRead[]) {
  render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <DesignDocumentBar projectId="p1" stages={stages} />
    </TamaguiProvider>,
  );
}

const approved = (stages: number[]) =>
  Object.fromEntries(stages.map((stage) => [stage, { state: "approved" as const, version: 1 }]));

function zipResponse(filename: string) {
  return new Response(new Uint8Array([0x50, 0x4b]), {
    status: 200,
    headers: { "Content-Disposition": `attachment; filename="${filename}"` },
  });
}

describe("DesignDocumentBar", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("unapprovedStages は対象のうち承認済み(古くない)でない段階を返す", () => {
    const stages = makeStages({ ...approved([1, 2]), 3: { state: "outdated" } });

    expect(unapprovedStages(stages, [1, 2, 3, 4])).toEqual([3, 4]);
    expect(unapprovedStages(stages, [1, 2])).toEqual([]);
  });

  it("元になる段階が承認されるまで、ボタンを押せなくし(透過)、未承認の段階を出す", () => {
    renderBar(makeStages(approved([1, 2, 3, 4])));

    const documentButton = screen.getByRole("button", { name: DOCUMENT_BUTTON });
    const procedureButton = screen.getByRole("button", { name: PROCEDURE_BUTTON });
    expect(documentButton).toHaveAttribute("aria-disabled", "true");
    expect(procedureButton).toHaveAttribute("aria-disabled", "true");
    expect(getComputedStyle(documentButton).opacity).toBe("0.5");
    const statuses = screen.getAllByRole("status");
    expect(statuses[0]).toHaveTextContent("段階5・6・7が未承認です。");
    expect(statuses[1]).toHaveTextContent("段階8が未承認です。");
    expect(screen.getByText(DOCUMENT_NOTICE)).toBeInTheDocument();
  });

  it("段階1〜7が承認済みなら詳細設計書・実装計画だけ押せる", () => {
    renderBar(makeStages(approved([1, 2, 3, 4, 5, 6, 7])));

    expect(screen.getByRole("button", { name: DOCUMENT_BUTTON })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: PROCEDURE_BUTTON })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("承認済みです。");
  });

  it("詳細設計書・実装計画の zip を Blob のまま保存させる", async () => {
    const saveFile = vi.spyOn(download, "saveFile").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue(zipResponse("detailed_design.zip"));
    vi.stubGlobal("fetch", fetchMock);
    renderBar(makeStages(approved([1, 2, 3, 4, 5, 6, 7])));

    await userEvent.click(screen.getByRole("button", { name: DOCUMENT_BUTTON }));

    await waitFor(() => expect(saveFile).toHaveBeenCalledTimes(1));
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/design-stages\/document$/);
    const [filename, content, mime] = saveFile.mock.calls[0];
    expect(filename).toBe("detailed_design.zip");
    expect(content).toBeInstanceOf(Blob);
    expect(mime).toBe("application/zip");
  });

  it("段階8が承認済みなら実装手順書の zip を保存させる", async () => {
    const saveFile = vi.spyOn(download, "saveFile").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue(zipResponse("implementation_procedure.zip"));
    vi.stubGlobal("fetch", fetchMock);
    renderBar(makeStages(approved([1, 2, 3, 4, 5, 6, 7, 8])));

    await userEvent.click(screen.getByRole("button", { name: PROCEDURE_BUTTON }));

    await waitFor(() => expect(saveFile).toHaveBeenCalledTimes(1));
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/design-stages\/procedure-document$/);
    expect(saveFile.mock.calls[0][0]).toBe("implementation_procedure.zip");
  });

  it("失敗したら理由を出す", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "段階7が承認されていません", code: "DESIGN_DOCUMENT_NOT_READY" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    renderBar(makeStages(approved([1, 2, 3, 4, 5, 6, 7])));

    await userEvent.click(screen.getByRole("button", { name: DOCUMENT_BUTTON }));

    expect(await screen.findByRole("alert")).toHaveTextContent("段階7が承認されていません");
  });

  it("簡易モード(段階8だけ)は実装手順書の zip だけを出す", () => {
    const stages = makeStages({ 8: { mode: "simple", state: "approved", version: 1 } }).slice(7);

    renderBar(stages);

    expect(availableDownloads(stages).map((item) => item.label)).toEqual([PROCEDURE_BUTTON]);
    expect(screen.queryByRole("button", { name: DOCUMENT_BUTTON })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: PROCEDURE_BUTTON })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
