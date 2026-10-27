import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ValidationError } from "@/data/types";
import { useArmyStore } from "@/store/useArmyStore";
import { unitDomId } from "../../../shared/domIds";
import { ValidityBadge } from "./ValidityBadge";

const GLOBAL_ERROR: ValidationError = {
  message: "List is 40 points over the cap.",
  targets: [],
};

const renderBadge = () =>
  render(
    <>
      <ValidityBadge />
      <div id={unitDomId("goblins")} />
      <div id={unitDomId("squigHerd")} />
    </>,
  );

const cardOf = (unitId: string) => document.getElementById(unitDomId(unitId));

describe("ValidityBadge", () => {
  const scrollSpy = vi.fn();

  beforeEach(() => {
    useArmyStore.getState().reset();
    useArmyStore.getState().setArmy("goblin");
    Element.prototype.scrollIntoView = scrollSpy;
  });

  it("reads Valid when there are no errors", () => {
    useArmyStore.setState({ errors: [] });
    renderBadge();

    expect(screen.getByTestId("valid-indicator")).toHaveTextContent("Valid");
  });

  it("counts the issues, singular and plural", () => {
    useArmyStore.setState({ errors: [GLOBAL_ERROR] });
    const { unmount } = renderBadge();

    expect(screen.getByTestId("invalid-indicator")).toHaveTextContent(
      /^1 issue$/,
    );

    unmount();
    useArmyStore.setState({ errors: [GLOBAL_ERROR, GLOBAL_ERROR] });
    renderBadge();

    expect(screen.getByTestId("invalid-indicator")).toHaveTextContent(
      /^2 issues$/,
    );
  });

  it("jumps to the first error target that is in the list, skipping unused units", async () => {
    const user = userEvent.setup();
    // squigHerd starts at zero in the goblin list; goblins is a force minimum.
    useArmyStore.setState({
      errors: [
        GLOBAL_ERROR,
        { message: "Squig Herd needs Goblins.", targets: ["squigHerd"] },
        { message: "Too few Goblins.", targets: ["goblins"] },
      ],
    });
    renderBadge();

    await user.click(screen.getByTestId("invalid-indicator"));

    expect(scrollSpy).toHaveBeenCalledTimes(1);
    // The spy records the element it was called on as its `this`.
    expect(scrollSpy.mock.contexts[0]).toBe(cardOf("goblins"));
  });

  it("does not scroll when only list-level errors remain", async () => {
    const user = userEvent.setup();
    useArmyStore.setState({ errors: [GLOBAL_ERROR] });
    renderBadge();

    await user.click(screen.getByTestId("invalid-indicator"));

    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
