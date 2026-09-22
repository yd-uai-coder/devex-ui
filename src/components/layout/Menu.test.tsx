import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "../../../tamagui.config";
import { Menu } from "./Menu";
import { useMenuStore } from "./menu-store";

function renderMenu() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Menu />
    </TamaguiProvider>,
  );
}

describe("Menu", () => {
  afterEach(() => {
    useMenuStore.setState({ isOpen: false });
  });

  it("starts closed and opens/closes via its own toggle button", async () => {
    const user = userEvent.setup();
    renderMenu();

    const menu = screen.getByTestId("menu");
    expect(menu).toHaveAttribute("data-open", "false");

    await user.click(screen.getByRole("button", { name: "メニューを開く" }));
    expect(menu).toHaveAttribute("data-open", "true");

    await user.click(screen.getByRole("button", { name: "メニューを閉じる" }));
    expect(menu).toHaveAttribute("data-open", "false");
  });

  it("renders the Counter and copy-theme links plus one placeholder link", () => {
    renderMenu();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);

    expect(screen.getByRole("link", { name: "Counter" })).toHaveAttribute(
      "href",
      "/counter",
    );
    expect(
      screen.getByRole("link", { name: "コンポーネントサンプル 3" }),
    ).toHaveAttribute("href", "/copy-theme");

    const placeholders = links.filter(
      (link) => link.getAttribute("href") === "#",
    );
    expect(placeholders).toHaveLength(1);
  });
});
