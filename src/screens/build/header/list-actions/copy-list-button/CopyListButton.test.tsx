import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useArmyStore } from "@/store/useArmyStore";
import { renderWithProviders } from "@/test/renderWithProviders";
import { CopyListButton } from "./CopyListButton";

const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  useArmyStore.getState().reset();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    configurable: true,
    writable: true,
  });
});

describe("CopyListButton", () => {
  it("calls navigator.clipboard.writeText with a string containing the army name", async () => {
    const user = userEvent.setup();
    // userEvent.setup() installs its own navigator.clipboard stub; re-assert our mock.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      configurable: true,
      writable: true,
    });
    useArmyStore.getState().setArmy("goblin");
    useArmyStore.getState().setUnitNumber("goblins", 2);

    renderWithProviders(<CopyListButton />);

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(mockWriteText).toHaveBeenCalledOnce();

    const text = mockWriteText.mock.calls[0][0] as string;

    expect(text).toContain("Goblin");
  });

  it('shows "Copied!" after clicking', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy("goblin");
    useArmyStore.getState().setUnitNumber("goblins", 1);

    renderWithProviders(<CopyListButton />);

    await user.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it('shows "Copy failed" when the clipboard rejects the write', async () => {
    const user = userEvent.setup();
    const rejectingWriteText = vi.fn().mockRejectedValue(new Error("denied"));

    // userEvent.setup() installs its own navigator.clipboard stub; replace it.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: rejectingWriteText },
      configurable: true,
      writable: true,
    });
    useArmyStore.getState().setArmy("goblin");

    renderWithProviders(<CopyListButton />);

    await user.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(screen.getByText("Copy failed")).toBeInTheDocument();
    });
  });

  it("is disabled when no army is loaded", () => {
    renderWithProviders(<CopyListButton />);

    expect(screen.getByRole("button", { name: "Copy" })).toBeDisabled();
  });
});
