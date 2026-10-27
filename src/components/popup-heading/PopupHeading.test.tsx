import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PopupHeading } from "./PopupHeading";

describe("PopupHeading", () => {
  it("shows its title and calls onClose from the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PopupHeading onClose={onClose}>Goblins · Rules</PopupHeading>);

    expect(screen.getByText("Goblins · Rules")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
