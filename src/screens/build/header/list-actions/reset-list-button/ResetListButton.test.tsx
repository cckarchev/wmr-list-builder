import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useArmyStore } from "@/store/useArmyStore";
import { ResetListButton } from "./ResetListButton";

const LocationProbe = () => {
  const { search } = useLocation();

  return <div data-testid="search">{search}</div>;
};

const renderReset = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/build/:armyId"
          element={
            <>
              <ResetListButton />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("ResetListButton", () => {
  beforeEach(() => {
    useArmyStore.getState().setArmy("goblin");
  });

  afterEach(() => {
    useArmyStore.getState().reset();
  });

  it("clears the ?list= param after confirming the reset", async () => {
    const user = userEvent.setup();
    renderReset("/build/goblin?list=abc123");

    expect(screen.getByTestId("search").textContent).toBe("?list=abc123");

    await user.click(screen.getByRole("button", { name: /reset/i }));
    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: /reset/i }));

    expect(screen.getByTestId("search").textContent).toBe("");
  });

  it("does nothing to the URL when the reset is cancelled", async () => {
    const user = userEvent.setup();
    renderReset("/build/goblin?list=abc123");

    await user.click(screen.getByRole("button", { name: /reset/i }));
    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("search").textContent).toBe("?list=abc123");
  });
});
