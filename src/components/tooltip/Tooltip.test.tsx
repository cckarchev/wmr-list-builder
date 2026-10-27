import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "./Tooltip";

const LABEL = "min 4 per 1,000 pts";
const BADGE = "min 8";
const BUBBLE_HEIGHT = 40;
const TRIGGER_NEAR_TOP = 10;

const setup = () => {
  const user = userEvent.setup();
  render(
    <>
      <Tooltip label={LABEL}>
        <span>{BADGE}</span>
      </Tooltip>
      <button type="button">Elsewhere</button>
    </>,
  );
  const trigger = screen.getByText(BADGE).parentElement as HTMLElement;

  return { user, trigger };
};

describe("Tooltip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("describes its trigger with the full label", () => {
    const { trigger } = setup();

    expect(trigger).toHaveAccessibleDescription(LABEL);
  });

  it("opens on a tap, since touch screens have no hover", async () => {
    const { user, trigger } = setup();
    await user.pointer({ keys: "[TouchA]", target: trigger });

    expect(trigger).toHaveAttribute("data-open", "true");
  });

  it("closes on a tap elsewhere", async () => {
    const { user, trigger } = setup();
    await user.pointer({ keys: "[TouchA]", target: trigger });
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));

    expect(trigger).toHaveAttribute("data-open", "false");
  });

  it("closes on Escape", async () => {
    const { user, trigger } = setup();
    await user.tab();
    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("data-open", "false");
  });

  it("opens below when there is no room above", async () => {
    const { user, trigger } = setup();
    const bubble = screen.getByRole("tooltip", { hidden: true });
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, TRIGGER_NEAR_TOP, BUBBLE_HEIGHT, BUBBLE_HEIGHT),
    );
    vi.spyOn(bubble, "getBoundingClientRect").mockReturnValue(
      new DOMRect(
        0,
        TRIGGER_NEAR_TOP - BUBBLE_HEIGHT,
        BUBBLE_HEIGHT,
        BUBBLE_HEIGHT,
      ),
    );
    await user.tab();

    expect(trigger).toHaveAttribute("data-placement", "below");
  });
});
