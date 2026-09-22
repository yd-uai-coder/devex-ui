import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "../../../../tamagui.config";
import { Counter } from "./Counter";
import { useCounterStore } from "./counter-store";

function renderCounter() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Counter />
    </TamaguiProvider>,
  );
}

describe("Counter", () => {
  afterEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it("increments, decrements, and resets the count on click", async () => {
    const user = userEvent.setup();
    renderCounter();

    expect(screen.getByText("0")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "+1" }));
    await user.click(screen.getByRole("button", { name: "+1" }));
    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "-1" }));
    expect(screen.getByText("1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
